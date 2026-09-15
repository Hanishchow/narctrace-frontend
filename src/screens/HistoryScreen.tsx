import { useEffect, useState } from "react";
import { getHistory, getHistoryDetail, ApiError } from "../api/client";
import type { EvidenceRecord, ResultClass } from "../api/types";
import { HistoryRow } from "../components/HistoryRow";
import { EvidenceCard } from "../components/EvidenceCard";
import { ResultBadge } from "../components/ResultBadge";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

interface HistoryScreenProps {
  onBack: () => void;
}

const RESULTS: (ResultClass | "")[] = ["", "Positive", "Negative", "Inconclusive"];

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultClass | "">("");
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EvidenceRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getHistory({ query, result: resultFilter })
      .then((res) => {
        setRecords(res.records);
        setCount(res.count);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load history (backend unreachable).",
        );
        setRecords([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultFilter]);

  const openDetail = async (testId: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await getHistoryDetail(testId);
      setDetail(res.record);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load record detail.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  if (detail) {
    return (
      <>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1 className="screen-title">Evidence record</h1>
            <p className="screen-subtitle mono">{detail.test_id}</p>
          </div>
          <Button variant="ghost" onClick={() => setDetail(null)}>
            Back to list
          </Button>
        </div>
        <ResultBadge result={detail.result} />
        <EvidenceCard
          testId={detail.test_id}
          color={detail.color}
          quality={detail.quality}
          operatorId={detail.operator_id}
          profileName={detail.profile_id}
          imageUrl={detail.image_url}
          evidence={{
            timestamp_utc: detail.timestamp_utc,
            timestamp_local: detail.timestamp_local,
            operator_id: detail.operator_id,
            gps: detail.gps,
            image_sha256: detail.image_sha256,
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="screen-title">History</h1>
          <p className="screen-subtitle">{count} record(s)</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>

      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Field
          label="Search"
          placeholder="Test ID or operator"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="stack">
          <span className="field__label">Result</span>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {RESULTS.map((r) => (
              <Button
                key={r || "all"}
                type="button"
                variant={resultFilter === r ? "primary" : "secondary"}
                onClick={() => setResultFilter(r)}
              >
                {r || "All"}
              </Button>
            ))}
          </div>
        </div>
        <Button type="submit" variant="secondary" block>
          Search
        </Button>
      </form>

      {loading && <p className="muted">Loading…</p>}
      {detailLoading && <p className="muted">Opening record…</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && records.length === 0 && (
        <p className="muted">No matching records.</p>
      )}

      <div className="stack">
        {records.map((rec) => (
          <HistoryRow key={rec.test_id} record={rec} onClick={openDetail} />
        ))}
      </div>
    </>
  );
}
