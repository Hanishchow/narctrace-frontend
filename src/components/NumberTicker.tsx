import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

interface NumberTickerProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

// Animates a number counting up from 0 to `value` on mount. Respects
// prefers-reduced-motion by rendering the final value immediately.
export function NumberTicker({ value, decimals = 1, duration = 700, className }: NumberTickerProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    startRef.current = null;
    let frame: number;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{display.toFixed(decimals)}</span>;
}
