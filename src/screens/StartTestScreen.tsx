import { useEffect, useState } from "react";
import { Check, History, MapPin, RefreshCw } from "lucide-react";
import { getProfiles, ApiError } from "../api/client";
import type { KitProfile } from "../api/types";
import { acquireGpsFix } from "../lib/geo";
import { useDemoMode } from "../lib/demoMode";
import { MOCK_PROFILES } from "../lib/mock";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import { cn } from "../lib/utils";
import type { TestSession } from "../App";

interface StartTestScreenProps {
  onProceed: (session: TestSession) => void;
  onViewHistory: () => void;
}

type GpsState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ok"; lat: number; lon: number; accuracy: number; label: string }
  | { status: "error"; message: string };

export function StartTestScreen({ onProceed, onViewHistory }: StartTestScreenProps) {
  const demo = useDemoMode();
  const [profiles, setProfiles] = useState<KitProfile[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gps, setGps] = useState<GpsState>({ status: "idle" });

  useEffect(() => {
    if (demo) {
      setProfiles(MOCK_PROFILES);
      setProfileId(MOCK_PROFILES[0].profile_id);
      setLoading(false);
      return;
    }
    let alive = true;
    getProfiles()
      .then((res) => {
        if (!alive) return;
        setProfiles(res.profiles);
        if (res.profiles[0]) setProfileId(res.profiles[0].profile_id);
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Could not load kit profiles (backend unreachable).",
        );
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [demo]);

  const locate = async () => {
    setGps({ status: "locating" });
    try {
      const fix = await acquireGpsFix();
      setGps({ status: "ok", ...fix });
    } catch (err) {
      setGps({
        status: "error",
        message:
          err instanceof Error ? err.message : "Unable to acquire GPS location.",
      });
    }
  };

  const proceed = () => {
    const profile = profiles.find((p) => p.profile_id === profileId);
    if (!profile) return;
    const gpsPayload =
      gps.status === "ok"
        ? { lat: gps.lat, lon: gps.lon, label: gps.label }
        : null;
    onProceed({ profile, gps: gpsPayload });
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Start a test</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a kit profile and capture location.
          </p>
        </div>
        <Button variant="ghost" onClick={onViewHistory} className="lg:hidden">
          <History className="h-4 w-4" aria-hidden="true" />
          History
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section className="flex flex-1 flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">1. Kit profile</h2>
          {loading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[70px] rounded-lg" />
              <Skeleton className="h-[70px] rounded-lg" />
            </div>
          )}
          {loadError && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {loadError}
            </p>
          )}
          {!loading && !loadError && profiles.length === 0 && (
            <p className="text-sm text-muted-foreground">No kit profiles available.</p>
          )}
          <div className="flex flex-col gap-2">
            {!loading && profiles.map((p) => {
              const checked = profileId === p.profile_id;
              return (
                <label
                  key={p.profile_id}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-3 rounded-lg border bg-card p-4 transition-colors",
                    checked ? "border-accent-strong" : "border-border hover:bg-accent",
                  )}
                >
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <br />
                    <span className="mono text-xs text-muted-foreground">
                      {p.profile_id} · v{p.version}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="profile"
                    value={p.profile_id}
                    checked={checked}
                    onChange={() => setProfileId(p.profile_id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      checked ? "border-accent-strong bg-accent-strong" : "border-border",
                    )}
                    aria-hidden="true"
                  >
                    {checked && <Check className="h-3.5 w-3.5 text-accent-strong-foreground" strokeWidth={3} />}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">2. Location</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            {gps.status === "idle" && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                GPS is optional but recommended for evidence traceability.
              </p>
            )}
            {gps.status === "locating" && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                Acquiring GPS…
              </p>
            )}
            {gps.status === "ok" && (
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" aria-hidden="true" />
                <span>
                  {gps.label || "Location acquired"}
                  <br />
                  <span className="mono text-xs text-muted-foreground">
                    {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)} (±{Math.round(gps.accuracy)}m)
                  </span>
                </span>
              </p>
            )}
            {gps.status === "error" && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {gps.message}
              </p>
            )}
            <div className="mt-3">
              <Button variant="secondary" onClick={locate} disabled={gps.status === "locating"}>
                {gps.status === "ok" ? "Re-acquire location" : "Acquire GPS location"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Button block onClick={proceed} disabled={!profileId} className="lg:w-auto lg:self-start lg:px-8">
        Continue to capture
      </Button>
    </>
  );
}
