import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AlertTriangle, LogOut, ShieldCheck } from "lucide-react";
import { health, getToken, setToken } from "./api/client";
import type {
  AnalysisResult,
  Gps,
  KitProfile,
  Officer,
} from "./api/types";
import { Disclaimer } from "./components/Disclaimer";
import { Sidebar } from "./components/Sidebar";
import { DotGrid } from "./components/DotGrid";
import { AppToaster } from "./components/AppToaster";
import { ThemeProvider } from "./lib/theme";
import { DemoModeProvider } from "./lib/demoMode";
import { cn } from "./lib/utils";
import { LandingScreen } from "./screens/LandingScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { StartTestScreen } from "./screens/StartTestScreen";
import { CaptureScreen } from "./screens/CaptureScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { Skeleton } from "./components/Skeleton";

// Overview pulls in recharts + TanStack Table — code-split so the landing
// page, login, and the rest of the app don't pay for that bundle weight.
const OverviewScreen = lazy(() => import("./screens/OverviewScreen").then((m) => ({ default: m.OverviewScreen })));

type Screen = "overview" | "start" | "capture" | "result" | "history";

// Backend health, checked on boot and shown as a persistent banner if down.
type Backend = "checking" | "ok" | "unreachable";

export interface TestSession {
  profile: KitProfile;
  gps: Gps | null;
}

export function App() {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [demo, setDemo] = useState(false);
  const [screen, setScreen] = useState<Screen>("overview");
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
    setDemo(false);
    setSession(null);
    setResult(null);
    setScreen("overview");
    setShowLogin(false);
  };

  const handleLogin = (o: Officer) => {
    setOfficer(o);
    setDemo(false);
    setScreen("overview");
  };

  const handleDemoLogin = (o: Officer) => {
    setOfficer(o);
    setDemo(true);
    setScreen("overview");
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
    backend === "unreachable" && !demo ? (
      <div
        role="alert"
        className="flex items-center justify-center gap-2 bg-destructive px-4 py-2.5 text-center text-sm font-medium text-destructive-foreground"
      >
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Backend unreachable — start the NarcTrace backend on port 8000, then{" "}
          <button
            type="button"
            onClick={pingHealth}
            className="min-h-0 underline underline-offset-2 hover:opacity-80"
          >
            retry
          </button>
          .
        </span>
      </div>
    ) : null;

  if (!officer) {
    if (!showLogin) {
      return (
        <ThemeProvider>
          <LandingScreen onGetStarted={() => setShowLogin(true)} />
          <AppToaster />
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider>
        <div className="relative flex min-h-screen flex-col bg-background">
          {banner}
          <LoginScreen
            onLogin={handleLogin}
            onDemoLogin={handleDemoLogin}
            backendReady={backend !== "unreachable"}
            onBack={() => setShowLogin(false)}
          />
          <Disclaimer />
        </div>
        <AppToaster />
      </ThemeProvider>
    );
  }

  const goOverview = () => setScreen("overview");
  const goStart = () => setScreen("start");
  const goHistory = () => setScreen("history");

  return (
    <ThemeProvider>
      <DemoModeProvider demo={demo}>
        <DotGrid />
        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <Sidebar
            officer={officer}
            screen={screen}
            demo={demo}
            onNavOverview={goOverview}
            onNavStart={goStart}
            onNavHistory={goHistory}
            onLogout={handleLogout}
          />

          <div className="relative flex min-w-0 flex-1 flex-col">
            {banner}
            {demo && (
              <div className="flex items-center justify-center gap-2 border-b border-border bg-accent-strong/10 px-4 py-2 text-center text-xs font-medium text-accent-strong lg:hidden">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Demo mode — using simulated data, no backend connected.
              </div>
            )}
            <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={goOverview}
                className="min-h-0 text-base font-bold tracking-tight"
              >
                NarcTrace
              </button>
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {officer.name} · <span className="mono">{officer.badge_id}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-0 items-center gap-1 font-medium text-foreground transition-opacity hover:opacity-70"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </span>
            </header>

            <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 lg:px-10 lg:py-10">
              <div
                className={cn(
                  "flex w-full max-w-lg flex-col gap-6",
                  screen === "history" || screen === "overview" ? "lg:max-w-4xl" : "lg:max-w-3xl",
                )}
              >
                {screen === "overview" && (
                  <Suspense fallback={<Skeleton className="h-[600px] rounded-lg" />}>
                    <OverviewScreen
                      officerName={officer.name}
                      onStartTest={goStart}
                      onViewHistory={goHistory}
                    />
                  </Suspense>
                )}
                {screen === "start" && (
                  <StartTestScreen
                    onProceed={startCapture}
                    onViewHistory={goHistory}
                  />
                )}
                {screen === "capture" && session && (
                  <CaptureScreen
                    session={session}
                    operatorId={officer.badge_id}
                    onCancel={goStart}
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
                    onViewHistory={goHistory}
                  />
                )}
                {screen === "history" && <HistoryScreen onBack={goStart} />}
              </div>
            </main>

            <Disclaimer />
          </div>
        </div>
        <AppToaster />
      </DemoModeProvider>
    </ThemeProvider>
  );
}
