import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { getHistory, getHistoryDetail, ApiError } from "../api/client";
import type { EvidenceRecord, ResultClass } from "../api/types";
import { useDemoMode } from "../lib/demoMode";
import { mockHistory } from "../lib/mock";
import { HistoryRow } from "../components/HistoryRow";
import { EvidenceCard } from "../components/EvidenceCard";
import { ResultBadge } from "../components/ResultBadge";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Skeleton } from "../components/Skeleton";

interface HistoryScreenProps {
  onBack: () => void;
}

const RESULTS: (ResultClass | "")[] = ["", "Positive", "Negative", "Inconclusive"];

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const demo = useDemoMode();
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
    if (demo) {
      const q = query.trim().toLowerCase();
      const filtered = mockHistory.filter((r) => {
        const matchesQuery =
          !q || r.test_id.toLowerCase().includes(q) || r.operator_id.toLowerCase().includes(q);
        const matchesResult = !resultFilter || r.result === resultFilter;
        return matchesQuery && matchesResult;
      });
      setRecords(filtered);
      setCount(filtered.length);
      setLoading(false);
      return;
    }
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
  }, [resultFilter, demo]);

  const openDetail = async (testId: string) => {
    setDetailLoading(true);
    setError(null);
    if (demo) {
      const rec = mockHistory.find((r) => r.test_id === testId) ?? null;
      setDetail(rec);
      setDetailLoading(false);
      return;
    }
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Evidence record</h1>
            <p className="mono mt-1 text-sm text-muted-foreground">{detail.test_id}</p>
          </div>
          <Button variant="ghost" onClick={() => setDetail(null)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">{count} record(s)</p>
        </div>
        <Button variant="ghost" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <form
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <div className="lg:flex-1">
          <Field
            label="Search"
            placeholder="Test ID or operator"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground lg:hidden">Result</span>
          <div className="flex flex-wrap gap-2">
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
        <Button type="submit" variant="secondary" block className="lg:w-auto">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search
        </Button>
      </form>

      {detailLoading && <p className="text-sm text-muted-foreground">Opening record…</p>}
      {error && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-muted-foreground">No matching records.</p>
      )}

      {loading ? (
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[70px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
          {records.map((rec) => (
            <HistoryRow key={rec.test_id} record={rec} onClick={openDetail} />
          ))}
        </div>
      )}
    </>
  );
}
