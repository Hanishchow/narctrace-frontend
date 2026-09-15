import { useEffect, useState } from "react";
import { getProfiles, ApiError } from "../api/client";
import type { KitProfile } from "../api/types";
import { acquireGpsFix } from "../lib/geo";
import { Button } from "../components/Button";
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
  const [profiles, setProfiles] = useState<KitProfile[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gps, setGps] = useState<GpsState>({ status: "idle" });

  useEffect(() => {
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
  }, []);

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
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="screen-title">Start a test</h1>
          <p className="screen-subtitle">Select a kit profile and capture location.</p>
        </div>
        <Button variant="ghost" onClick={onViewHistory}>
          History
        </Button>
      </div>

      <section className="stack">
        <h2 className="text-sm" style={{ fontSize: "var(--fs-3)" }}>
          1. Kit profile
        </h2>
        {loading && <p className="muted">Loading profiles…</p>}
        {loadError && (
          <p className="field__error" role="alert">
            {loadError}
          </p>
        )}
        {!loading && !loadError && profiles.length === 0 && (
          <p className="muted">No kit profiles available.</p>
        )}
        <div className="stack">
          {profiles.map((p) => (
            <label key={p.profile_id} className="card" style={{ cursor: "pointer" }}>
              <span className="row" style={{ alignItems: "flex-start" }}>
                <input
                  type="radio"
                  name="profile"
                  value={p.profile_id}
                  checked={profileId === p.profile_id}
                  onChange={() => setProfileId(p.profile_id)}
                  style={{ marginTop: 4, width: 20, height: 20 }}
                />
                <span>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <br />
                  <span className="text-sm muted mono">
                    {p.profile_id} · v{p.version}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2 style={{ fontSize: "var(--fs-3)" }}>2. Location</h2>
        <div className="card">
          {gps.status === "idle" && (
            <p className="muted text-sm" style={{ marginTop: 0 }}>
              GPS is optional but recommended for evidence traceability.
            </p>
          )}
          {gps.status === "locating" && <p className="muted">Acquiring GPS…</p>}
          {gps.status === "ok" && (
            <p style={{ margin: 0 }}>
              {gps.label || "Location acquired"}
              <br />
              <span className="text-sm muted mono">
                {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)} (±{Math.round(gps.accuracy)}m)
              </span>
            </p>
          )}
          {gps.status === "error" && (
            <p className="field__error" role="alert" style={{ margin: 0 }}>
              {gps.message}
            </p>
          )}
          <div style={{ marginTop: "var(--space-3)" }}>
            <Button variant="secondary" onClick={locate} disabled={gps.status === "locating"}>
              {gps.status === "ok" ? "Re-acquire location" : "Acquire GPS location"}
            </Button>
          </div>
        </div>
      </section>

      <Button block onClick={proceed} disabled={!profileId}>
        Continue to capture
      </Button>
    </>
  );
}
