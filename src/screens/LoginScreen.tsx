import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { login, setToken, ApiError } from "../api/client";
import type { Officer } from "../api/types";
import { mockLogin } from "../lib/mock";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

interface LoginScreenProps {
  onLogin: (officer: Officer) => void;
  onDemoLogin: (officer: Officer) => void;
  backendReady: boolean;
  onBack?: () => void;
}

export function LoginScreen({ onLogin, onDemoLogin, backendReady, onBack }: LoginScreenProps) {
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

  const enterDemo = () => {
    onDemoLogin(mockLogin(badgeId.trim()));
  };

  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

        <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
        </span>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Field evidence, recorded with precision.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            NarcTrace guides officers through a standardized capture of a colorimetric
            drug-test reaction and produces a tamper-evident evidence record — Test ID,
            timestamp, GPS, and image hash — in a searchable history.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/60">
          Presumptive field-test result only. Not a substitute for lab confirmation.
        </p>
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-6 top-6 inline-flex min-h-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-opacity hover:opacity-70 sm:left-10 sm:top-10"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>
        )}
        <div className="mx-auto flex w-full max-w-sm animate-slide-up flex-col gap-10">
          <div className="flex flex-col gap-2 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-strong text-accent-strong-foreground">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">NarcTrace</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to record field drug-test evidence.
            </p>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold tracking-tight">Officer sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your badge credentials to continue.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <Field
              label="Badge ID"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              autoComplete="username"
              autoCapitalize="characters"
              placeholder="FIELD-OP-01"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              error={error ?? undefined}
            />
            <Button
              type="submit"
              block
              className="mt-1"
              disabled={busy || !badgeId || !password || !backendReady}
            >
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
            {!backendReady && (
              <p className="text-sm text-muted-foreground" role="status">
                Backend not reachable right now.
              </p>
            )}
          </form>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <Button type="button" variant="secondary" block onClick={enterDemo}>
              Continue in demo mode
            </Button>
            <p className="text-xs text-muted-foreground">
              Explore the full flow with simulated data — no backend required.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
