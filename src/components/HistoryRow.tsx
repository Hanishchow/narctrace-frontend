import type { EvidenceRecord } from "../api/types";
import "./HistoryRow.css";

interface HistoryRowProps {
  record: EvidenceRecord;
  onClick: (testId: string) => void;
}

const DOT_CLASS: Record<string, string> = {
  Positive: "history-row__dot--positive",
  Negative: "history-row__dot--negative",
  Inconclusive: "history-row__dot--inconclusive",
};

export function HistoryRow({ record, onClick }: HistoryRowProps) {
  return (
    <button
      type="button"
      className="history-row"
      onClick={() => onClick(record.test_id)}
    >
      <span className="history-row__main">
        <span className="history-row__test-id mono">{record.test_id}</span>
        <span className="history-row__meta text-sm muted">
          {record.profile_id} · {record.timestamp_local || record.timestamp_utc}
        </span>
      </span>
      <span className="history-row__result">
        <span
          className={`history-row__dot ${DOT_CLASS[record.result] ?? ""}`}
          aria-hidden="true"
        />
        <span className="history-row__result-text">{record.result}</span>
      </span>
    </button>
  );
}
