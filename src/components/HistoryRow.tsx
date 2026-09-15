import { ChevronRight } from "lucide-react";
import type { EvidenceRecord } from "../api/types";
import { cn } from "../lib/utils";

interface HistoryRowProps {
  record: EvidenceRecord;
  onClick: (testId: string) => void;
}

const DOT_CLASS: Record<string, string> = {
  Positive: "bg-positive",
  Negative: "bg-negative",
  Inconclusive: "bg-inconclusive",
};

const TEXT_CLASS: Record<string, string> = {
  Positive: "text-positive",
  Negative: "text-negative",
  Inconclusive: "text-inconclusive",
};

export function HistoryRow({ record, onClick }: HistoryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(record.test_id)}
      className="flex min-h-[var(--tap-min)] w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent"
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="mono truncate text-sm font-medium">{record.test_id}</span>
        <span className="truncate text-xs text-muted-foreground">
          {record.profile_id} · {record.timestamp_local || record.timestamp_utc}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", DOT_CLASS[record.result] ?? "bg-muted-foreground")} aria-hidden="true" />
        <span className={cn("text-sm font-medium", TEXT_CLASS[record.result] ?? "")}>{record.result}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </span>
    </button>
  );
}
