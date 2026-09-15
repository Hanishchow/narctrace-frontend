import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { getHistory, ApiError } from "../api/client";
import type { EvidenceRecord } from "../api/types";
import { useDemoMode } from "../lib/demoMode";
import { mockDashboardHistory } from "../lib/mock";
import { StatCard } from "../components/dashboard/StatCard";
import { ActivityChart } from "../components/dashboard/ActivityChart";
import { RecordsTable } from "../components/dashboard/RecordsTable";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";

interface OverviewScreenProps {
  officerName: string;
  onStartTest: () => void;
  onViewHistory: () => void;
}

function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function OverviewScreen({ officerName, onStartTest, onViewHistory }: OverviewScreenProps) {
  const demo = useDemoMode();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setRecords(mockDashboardHistory);
      setLoading(false);
      return;
    }
    let alive = true;
    getHistory({})
      .then((res) => alive && setRecords(res.records))
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Could not load recent activity.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [demo]);

  const stats = useMemo(() => {
    const now = Date.now();
    const last7 = records.filter((r) => now - new Date(r.timestamp_utc).getTime() < 7 * 86_400_000);
    const prev7 = records.filter((r) => {
      const age = now - new Date(r.timestamp_utc).getTime();
      return age >= 7 * 86_400_000 && age < 14 * 86_400_000;
    });
    const count = (list: EvidenceRecord[], result: string) => list.filter((r) => r.result === result).length;

    return {
      total: records.length,
      totalTrend: trendPercent(last7.length, prev7.length),
      positive: count(records, "Positive"),
      positiveTrend: trendPercent(count(last7, "Positive"), count(prev7, "Positive")),
      negative: count(records, "Negative"),
      negativeTrend: trendPercent(count(last7, "Negative"), count(prev7, "Negative")),
      inconclusive: count(records, "Inconclusive"),
      inconclusiveTrend: trendPercent(count(last7, "Inconclusive"), count(prev7, "Inconclusive")),
    };
  }, [records]);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {officerName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happened across your field tests.
          </p>
        </div>
        <Button onClick={onStartTest}>
          <Camera className="h-4 w-4" aria-hidden="true" />
          New test
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total tests"
            value={stats.total}
            icon={ClipboardList}
            trend={stats.totalTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Positive"
            value={stats.positive}
            icon={CheckCircle2}
            tone="positive"
            trend={stats.positiveTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Negative"
            value={stats.negative}
            icon={XCircle}
            tone="negative"
            trend={stats.negativeTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Inconclusive"
            value={stats.inconclusive}
            icon={AlertTriangle}
            tone="inconclusive"
            trend={stats.inconclusiveTrend}
            description="vs. previous 7 days"
          />
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Skeleton className="h-[300px] rounded-lg" />
      ) : (
        <ActivityChart records={records} />
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent activity</h2>
          <Button variant="ghost" onClick={onViewHistory}>
            View full history
          </Button>
        </div>

        {loading ? (
          <Skeleton className="h-[360px] rounded-lg" />
        ) : (
          <RecordsTable records={records} onOpenRecord={onViewHistory} />
        )}
      </section>
    </>
  );
}
