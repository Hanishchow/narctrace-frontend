import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { analyze, ApiError } from "../api/client";
import type { AnalysisResult } from "../api/types";
import { useDemoMode } from "../lib/demoMode";
import { mockAnalyze } from "../lib/mock";
import { CameraFrame } from "../components/CameraFrame";
import { Button } from "../components/Button";
import type { TestSession } from "../App";

interface CaptureScreenProps {
  session: TestSession;
  operatorId: string;
  onCancel: () => void;
  onResult: (result: AnalysisResult) => void;
}

type Phase = "starting" | "live" | "captured" | "analyzing";

export function CaptureScreen({
  session,
  operatorId,
  onCancel,
  onResult,
}: CaptureScreenProps) {
  const demo = useDemoMode();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [status, setStatus] = useState<string>("Starting camera…");
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<{ blob: Blob; url: string } | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setPhase("live");
        setStatus("Align the reaction well inside the box");
      } catch {
        setError(
          "Camera unavailable. Grant camera permission (HTTPS or localhost required).",
        );
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  // Demo-only: synthesize a placeholder capture (no camera needed) so the
  // flow is never blocked when no device camera is available.
  const simulateCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#3a2f52";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#6d28d9";
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, 140, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCaptured((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url };
        });
        setPhase("captured");
        stopStream();
      },
      "image/jpeg",
      0.92,
    );
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCaptured((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url };
        });
        setPhase("captured");
        stopStream();
      },
      "image/jpeg",
      0.92,
    );
  };

  const retake = () => {
    if (captured) URL.revokeObjectURL(captured.url);
    setCaptured(null);
    setError(null);
    setPhase("starting");
    setStatus("Restarting camera…");
    // re-run effect by remounting camera: simplest is reload stream inline
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setPhase("live");
        setStatus("Align the reaction well inside the box");
      } catch {
        setError("Camera unavailable.");
      }
    })();
  };

  const submit = async () => {
    if (!captured) return;
    setPhase("analyzing");
    setError(null);
    try {
      const payload = {
        image: captured.blob,
        profile_id: session.profile.profile_id,
        operator_id: operatorId,
        gps: session.gps,
      };
      const result = demo ? await mockAnalyze(payload) : await analyze(payload);
      toast.success(`Analysis complete — ${result.result}`, {
        description: result.test_id,
      });
      onResult(result);
    } catch (err) {
      setPhase("captured");
      if (err instanceof ApiError && err.status === 422) {
        // Quality gate rejected the image — this is recapture guidance, not a result.
        const d = err.detail as { reason?: string; issues?: string[] } | undefined;
        const issues = Array.isArray(d?.issues) ? d!.issues!.join(" · ") : "";
        setError(
          `Image not usable: ${d?.reason ?? err.message}.${issues ? ` ${issues}. ` : " "}Please retake.`,
        );
      } else if (err instanceof ApiError) {
        setError(`Analysis failed: ${err.message}`);
        toast.error("Analysis failed", { description: err.message });
      } else {
        setError("Could not reach the backend to analyze the image.");
        toast.error("Could not reach the backend");
      }
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Capture reaction</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {session.profile.name} · <span className="mono">{session.profile.profile_id}</span>
        </p>
      </div>

      {captured ? (
        <img
          src={captured.url}
          alt="Captured reaction preview"
          className="w-full rounded-lg border border-border"
        />
      ) : (
        <CameraFrame ref={videoRef} status={status} active={phase === "live"} />
      )}

      {error && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {phase === "live" && (
          <Button block onClick={capture}>
            Capture image
          </Button>
        )}
        {demo && (phase === "live" || phase === "starting") && (
          <Button variant="secondary" block onClick={simulateCapture}>
            Simulate capture (demo)
          </Button>
        )}
        {(phase === "captured" || phase === "analyzing") && (
          <>
            <Button block onClick={submit} disabled={phase === "analyzing"}>
              {phase === "analyzing" ? "Analyzing…" : "Analyze"}
            </Button>
            <Button variant="secondary" block onClick={retake} disabled={phase === "analyzing"}>
              Retake
            </Button>
          </>
        )}
        <Button variant="ghost" block onClick={onCancel} disabled={phase === "analyzing"}>
          Cancel
        </Button>
      </div>
    </>
  );
}
