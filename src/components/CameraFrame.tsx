import { forwardRef } from "react";
import "./CameraFrame.css";

interface CameraFrameProps {
  status?: string;
  active: boolean;
}

// Live camera preview with a centre focus box (the reaction-well target).
export const CameraFrame = forwardRef<HTMLVideoElement, CameraFrameProps>(
  ({ status, active }, ref) => {
    return (
      <div className="camera-frame">
        <video
          ref={ref}
          className="camera-frame__video"
          playsInline
          muted
          autoPlay
        />
        {active && (
          <div className="camera-frame__focus" aria-hidden="true">
            <span className="camera-frame__corner camera-frame__corner--tl" />
            <span className="camera-frame__corner camera-frame__corner--tr" />
            <span className="camera-frame__corner camera-frame__corner--bl" />
            <span className="camera-frame__corner camera-frame__corner--br" />
          </div>
        )}
        {status && <p className="camera-frame__status">{status}</p>}
      </div>
    );
  },
);
CameraFrame.displayName = "CameraFrame";
