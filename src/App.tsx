import { useCallback, useEffect, useState } from "react";
import { health, getToken, setToken } from "./api/client";
import type {
  AnalysisResult,
  Gps,
  KitProfile,
  Officer,
} from "./api/types";
import { Disclaimer } from "./components/Disclaimer";
import { LoginScreen } from "./screens/LoginScreen";
import { StartTestScreen } from "./screens/StartTestScreen";
import { CaptureScreen } from "./screens/CaptureScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { HistoryScreen } from "./screens/HistoryScreen";

type Screen = "start" | "capture" | "result" | "history";

// Backend health, checked on boot and shown as a persistent banner if down.
type Backend = "checking" | "ok" | "unreachable";

export interface TestSession {
  profile: KitProfile;
  gps: Gps | null;
}

export function App() {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [screen, setScreen] = useState<Screen>("start");
  const [backend, setBackend] = useState<Backend>("checking");
  const [session, setSession] = useState<TestSession | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pingHealth = useCallback(() => {
    setBackend("checking");
    health()
      .then((h) => setBackend(h.status === "ok" ? "ok" : "unreachable"))
      .catch(() => setBackend("unreachable"));
  }, []);

  useEffect(() => {
    pingHealth();
  }, [pingHealth]);

  // Restore an in-tab session token (sessionStorage) but require officer re-entry
  // of identity is not persisted — only the token is. If a token exists we still
  // land on login until the officer object is set, keeping identity explicit.
  useEffect(() => {
    if (!getToken()) setOfficer(null);
  }, []);

  const handleLogout = () => {
    setToken(null);
    setOfficer(null);
    setSession(null);
    setResult(null);
    setScreen("start");
  };

  const handleLogin = (o: Officer) => {
    setOfficer(o);
    setScreen("start");
  };

  const startCapture = (s: TestSession) => {
    setSession(s);
    setScreen("capture");
  };

  const showResult = (r: AnalysisResult) => {
    setResult(r);
    setScreen("result");
  };

  const banner =
    backend === "unreachable" ? (
      <div className="banner banner--error" role="alert">
        Backend unreachable — start the NarcTrace backend on port 8000, then{" "}
        <button type="button" className="linkbtn" onClick={pingHealth}>
          retry
        </button>
        .
      </div>
    ) : null;

  if (!officer) {
    return (
      <div className="app-shell">
        {banner}
        <LoginScreen onLogin={handleLogin} backendReady={backend !== "unreachable"} />
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {banner}
      <header className="app-header">
        <span className="app-header__brand">NarcTrace</span>
        <span className="app-header__officer">
          {officer.name} · {officer.badge_id}{" "}
          <button type="button" className="linkbtn" onClick={handleLogout}>
            Sign out
          </button>
        </span>
      </header>

      <main className="app-main">
        {screen === "start" && (
          <StartTestScreen
            onProceed={startCapture}
            onViewHistory={() => setScreen("history")}
          />
        )}
        {screen === "capture" && session && (
          <CaptureScreen
            session={session}
            operatorId={officer.badge_id}
            onCancel={() => setScreen("start")}
            onResult={showResult}
          />
        )}
        {screen === "result" && result && (
          <ResultScreen
            result={result}
            onNewTest={() => {
              setResult(null);
              setSession(null);
              setScreen("start");
            }}
            onViewHistory={() => setScreen("history")}
          />
        )}
        {screen === "history" && (
          <HistoryScreen onBack={() => setScreen("start")} />
        )}
      </main>

      <Disclaimer />
    </div>
  );
}
