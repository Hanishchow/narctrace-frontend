import { useEffect, useRef, useState } from "react";
import { analyze, ApiError } from "../api/client";
import type { AnalysisResult } from "../api/types";
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
      const result = await analyze({
        image: captured.blob,
        profile_id: session.profile.profile_id,
        operator_id: operatorId,
        gps: session.gps,
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
      } else {
        setError("Could not reach the backend to analyze the image.");
      }
    }
  };

  return (
    <>
      <div>
        <h1 className="screen-title">Capture reaction</h1>
        <p className="screen-subtitle">
          {session.profile.name} · <span className="mono">{session.profile.profile_id}</span>
        </p>
      </div>

      {captured ? (
        <img
          src={captured.url}
          alt="Captured reaction preview"
          style={{
            width: "100%",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
          }}
        />
      ) : (
        <CameraFrame ref={videoRef} status={status} active={phase === "live"} />
      )}

      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      <div className="stack">
        {phase === "live" && (
          <Button block onClick={capture}>
            Capture image
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
