import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ResultClass } from "../api/types";
import { cn } from "../lib/utils";

// Result must be unmistakable: large type + colour + icon + text.
// Colour is NEVER the sole signal (WCAG / PRD §7).

const STYLES: Record<ResultClass, { bg: string; text: string; border: string }> = {
  Positive: { bg: "bg-positive-bg", text: "text-positive", border: "border-positive/30" },
  Negative: { bg: "bg-negative-bg", text: "text-negative", border: "border-negative/30" },
  Inconclusive: { bg: "bg-inconclusive-bg", text: "text-inconclusive", border: "border-inconclusive/30" },
};

const ICONS: Record<ResultClass, typeof CheckCircle2> = {
  Positive: CheckCircle2,
  Negative: XCircle,
  Inconclusive: AlertTriangle,
};

export function ResultBadge({ result }: { result: ResultClass }) {
  const s = STYLES[result];
  const Icon = ICONS[result];
  return (
    <div
      role="status"
      aria-label={`Test result: ${result}`}
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border px-6 py-8 animate-fade-in",
        s.bg,
        s.border,
      )}
    >
      <Icon className={cn("h-9 w-9 shrink-0", s.text)} strokeWidth={2.25} aria-hidden="true" />
      <span className={cn("text-[32px] font-bold leading-none tracking-tight", s.text)}>
        {result}
      </span>
    </div>
  );
}
