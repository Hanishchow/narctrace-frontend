import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Zap } from "lucide-react";
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
  const [tab, setTab] = useState<"quick" | "badge">("quick");

  // Quick access state
  const [quickName, setQuickName] = useState("");
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Badge login state
  const [badgeId, setBadgeId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Quick access: uses a name-derived badge ID. Backend accepts any non-empty
  // password — it hashes only the badge_id, not the password itself.
  const handleQuickAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    setQuickBusy(true);
    const displayName = quickName.trim() || "Field Officer";
    const slug = displayName.replace(/[^A-Za-z0-9]/g, "-").toUpperCase().slice(0, 20);
    const derivedBadge = `FO-${slug}`;
    try {
      const res = await login(derivedBadge, "narctrace-field");
      setToken(res.token);
      onLogin({ ...res.officer, name: displayName });
    } catch (err) {
      setQuickError(
        err instanceof ApiError ? err.message : "Backend unreachable — try demo mode.",
      );
    } finally {
      setQuickBusy(false);
    }
  };

  const handleBadgeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      const res = await login(badgeId.trim(), password);
      setToken(res.token);
      onLogin(res.officer);
    } catch (err) {
      setLoginError(
        err instanceof ApiError
          ? err.status === 401 ? "Invalid badge ID or password." : err.message
          : "Could not reach the backend.",
      );
    } finally {
      setLoginBusy(false);
    }
  };

  const enterDemo = () => onDemoLogin(mockLogin(quickName.trim() || badgeId.trim()));

  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      {/* Left panel — video backdrop */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          autoPlay loop muted playsInline aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
        <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
        </span>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Every capture. Tamper-evident. Court-ready.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            NarcTrace digitises the colorimetric field drug-test reaction into a
            verified evidence record — Test ID, GPS, image hash, and custody chain —
            in seconds.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          Presumptive field-test result only. Not a substitute for lab confirmation.
        </p>
      </div>

      {/* Right panel — auth forms */}
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

        <div className="mx-auto flex w-full max-w-sm animate-slide-up flex-col gap-8">
          {/* Mobile header */}
          <div className="flex flex-col gap-2 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-strong text-accent-strong-foreground">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">NarcTrace</h1>
            <p className="text-sm text-muted-foreground">Start recording field evidence.</p>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold tracking-tight">Access NarcTrace</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your name to capture, or sign in with a badge ID.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border bg-muted p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setTab("quick")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
                tab === "quick" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Quick access
            </button>
            <button
              type="button"
              onClick={() => setTab("badge")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition-colors ${
                tab === "badge" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Badge sign in
            </button>
          </div>

          {/* Quick access tab */}
          {tab === "quick" && (
            <form className="flex flex-col gap-4" onSubmit={handleQuickAccess} noValidate>
              <Field
                label="Your name (optional)"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="e.g. Constable Sharma"
                autoComplete="name"
                error={quickError ?? undefined}
              />
              <p className="text-xs text-muted-foreground">
                No account needed. Camera, GPS, and evidence capture are fully available.
              </p>
              <Button
                type="submit"
                block
                disabled={quickBusy || !backendReady}
              >
                {quickBusy ? "Starting…" : "Start capturing"}
                {!quickBusy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
              {!backendReady && (
                <p className="text-sm text-muted-foreground" role="status">
                  Backend not reachable — use demo mode below.
                </p>
              )}
            </form>
          )}

          {/* Badge sign in tab */}
          {tab === "badge" && (
            <form className="flex flex-col gap-4" onSubmit={handleBadgeLogin} noValidate>
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
                error={loginError ?? undefined}
              />
              <Button
                type="submit"
                block
                className="mt-1"
                disabled={loginBusy || !badgeId || !password || !backendReady}
              >
                {loginBusy ? "Signing in…" : "Sign in"}
                {!loginBusy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>
          )}

          {/* Demo mode */}
          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <Button type="button" variant="secondary" block onClick={enterDemo}>
              Continue in demo mode
            </Button>
            <p className="text-xs text-muted-foreground">
              Full UI with simulated analysis — no backend or camera required.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
