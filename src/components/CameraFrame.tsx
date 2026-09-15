import { forwardRef } from "react";
import { cn } from "../lib/utils";

interface CameraFrameProps {
  status?: string;
  active: boolean;
}

const CORNER_BASE = "absolute h-7 w-7 border-accent-strong";

// Live camera preview with a centre focus box (the reaction-well target).
export const CameraFrame = forwardRef<HTMLVideoElement, CameraFrameProps>(
  ({ status, active }, ref) => {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[hsl(var(--camera-bg))]">
        <video
          ref={ref}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
        />
        {active && (
          <div
            className="pointer-events-none absolute inset-[12%] rounded-lg"
            aria-hidden="true"
          >
            <span className={cn(CORNER_BASE, "left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]")} />
            <span className={cn(CORNER_BASE, "right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]")} />
            <span className={cn(CORNER_BASE, "bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]")} />
            <span className={cn(CORNER_BASE, "bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]")} />
          </div>
        )}
        {status && (
          <p className="absolute inset-x-0 bottom-0 bg-[hsl(var(--camera-scrim))]/70 px-4 py-2.5 text-center text-sm font-medium text-white backdrop-blur-sm">
            {status}
          </p>
        )}
      </div>
    );
  },
);
CameraFrame.displayName = "CameraFrame";
