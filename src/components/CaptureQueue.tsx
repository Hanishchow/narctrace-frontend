import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, Upload } from "lucide-react";
import { analyze } from "../api/client";
import { CAPTURE_QUEUE_CHANGED, flushQueuedCaptures, queuedCapturesFor } from "../offline/captureQueue";
import { Button } from "./Button";

export function CaptureQueue({ operatorId }: { operatorId: string }) {
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => queuedCapturesFor(operatorId).then((captures) => setCount(captures.length)).catch(() => setMessage("Offline queue is unavailable on this browser."));

  useEffect(() => {
    refresh();
    const networkChange = () => { setOnline(navigator.onLine); refresh(); };
    window.addEventListener("online", networkChange);
    window.addEventListener("offline", networkChange);
    window.addEventListener(CAPTURE_QUEUE_CHANGED, refresh);
    return () => {
      window.removeEventListener("online", networkChange);
      window.removeEventListener("offline", networkChange);
      window.removeEventListener(CAPTURE_QUEUE_CHANGED, refresh);
    };
  }, [operatorId]);

  const sync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const result = await flushQueuedCaptures(operatorId, (capture) => analyze({
        image: capture.image,
        profile_id: capture.profileId,
        operator_id: capture.operatorId,
        gps: capture.gps,
        idempotency_key: capture.idempotencyKey,
      }));
      setMessage(result.submitted ? `${result.submitted} capture${result.submitted === 1 ? "" : "s"} synced.` : "No queued captures could be synced yet.");
      refresh();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Device queue</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{count} capture{count === 1 ? "" : "s"} waiting</h2>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${online ? "bg-positive-bg text-positive" : "bg-inconclusive-bg text-inconclusive"}`}>
          {online ? <Upload className="h-3.5 w-3.5" aria-hidden="true" /> : <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />}
          {online ? "Online" : "Offline"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Queued images stay on this device until the original officer can submit them with the same evidence receipt.</p>
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
      <div className="mt-4">
        <Button variant="secondary" onClick={sync} disabled={!online || !count || syncing}>
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} aria-hidden="true" />
          {syncing ? "Syncing captures" : "Retry queued captures"}
        </Button>
      </div>
    </section>
  );
}
