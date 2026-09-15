import { useState } from "react";
import { login, setToken, ApiError } from "../api/client";
import type { Officer } from "../api/types";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

interface LoginScreenProps {
  onLogin: (officer: Officer) => void;
  backendReady: boolean;
}

export function LoginScreen({ onLogin, backendReady }: LoginScreenProps) {
  const [badgeId, setBadgeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await login(badgeId.trim(), password);
      setToken(res.token);
      onLogin(res.officer);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 401
            ? "Invalid badge ID or password."
            : err.message
          : "Could not reach the backend. Check it is running on port 8000.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-main" style={{ justifyContent: "center" }}>
      <div>
        <h1 className="screen-title">Officer sign in</h1>
        <p className="screen-subtitle">
          Authenticate to record field drug-test evidence.
        </p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field
          label="Badge ID"
          value={badgeId}
          onChange={(e) => setBadgeId(e.target.value)}
          autoComplete="username"
          autoCapitalize="characters"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          error={error ?? undefined}
        />
        <Button
          type="submit"
          block
          disabled={busy || !badgeId || !password || !backendReady}
        >
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        {!backendReady && (
          <p className="text-sm muted" role="status">
            Waiting for the backend to become reachable…
          </p>
        )}
      </form>
    </main>
  );
}
