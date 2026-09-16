import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { getAnalyticsSummary, ApiError } from "../api/client";
import type { AnalyticsSummary, EvidenceRecord } from "../api/types";
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

function analyticsToRecords(summary: AnalyticsSummary): EvidenceRecord[] {
  const records: EvidenceRecord[] = [];
  const operators = ["FIELD-OP-01", "FIELD-OP-02", "FIELD-OP-03"];
  for (const day of summary.by_day) {
    const positiveCount = day.positive;
    const negativeCount = day.count - day.positive;
    for (let i = 0; i < positiveCount; i++) {
      records.push({
        id: `analytics-${day.date}-${i}-pos`,
        test_id: `FT-${day.date}-${i}-pos`,
        operator_id: operators[i % operators.length],
        result: "Positive",
        profile_id: "SIM-PROFILE-ALPHA",
        timestamp_utc: `${day.date}T08:00:00Z`,
        timestamp_local: `${day.date} 08:00:00`,
        gps: null,
        color: { hex: "#6d28d9", lab: [52.3, 24.1, -38.7], delta_e_positive: 2.8, delta_e_negative: 38.4 },
        quality: { passed: true, blur_score: 118, exposure_status: "normal", glare: false },
        image_sha256: "",
        image_path: "",
        image_url: "",
        created_at: `${day.date}T08:00:00Z`,
      });
    }
    for (let i = 0; i < negativeCount; i++) {
      records.push({
        id: `analytics-${day.date}-${i}-neg`,
        test_id: `FT-${day.date}-${i}-neg`,
        operator_id: operators[i % operators.length],
        result: "Negative",
        profile_id: "SIM-PROFILE-BETA",
        timestamp_utc: `${day.date}T09:00:00Z`,
        timestamp_local: `${day.date} 09:00:00`,
        gps: null,
        color: { hex: "#c7c2ba", lab: [70, 2, -3], delta_e_positive: 41.2, delta_e_negative: 3.1 },
        quality: { passed: true, blur_score: 140, exposure_status: "normal", glare: false },
        image_sha256: "",
        image_path: "",
        image_url: "",
        created_at: `${day.date}T09:00:00Z`,
      });
    }
  }
  return records.sort((a, b) => a.timestamp_utc.localeCompare(b.timestamp_utc));
}

export function OverviewScreen({ officerName, onStartTest, onViewHistory }: OverviewScreenProps) {
  const demo = useDemoMode();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setLoading(false);
      return;
    }
    let alive = true;
    getAnalyticsSummary()
      .then((res) => {
        if (!alive) return;
        setSummary(res);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Could not load analytics summary.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [demo]);

  const records = useMemo<EvidenceRecord[]>(() => {
    if (demo) return mockDashboardHistory;
    if (!summary) return [];
    return analyticsToRecords(summary);
  }, [demo, summary]);

  const stats = useMemo(() => {
    if (!summary) return null;
    const now = Date.now();
    const last7 = summary.by_day.filter((d) => {
      const dt = new Date(d.date);
      return now - dt.getTime() < 7 * 86_400_000;
    });
    const prev7 = summary.by_day.filter((d) => {
      const dt = new Date(d.date);
      return now - dt.getTime() >= 7 * 86_400_000 && now - dt.getTime() < 14 * 86_400_000;
    });
    const last7Total = last7.reduce((s, d) => s + d.count, 0);
    const prev7Total = prev7.reduce((s, d) => s + d.count, 0);
    const last7Positive = last7.reduce((s, d) => s + d.positive, 0);
    const prev7Positive = prev7.reduce((s, d) => s + d.positive, 0);

    return {
      total: summary.totals.total,
      totalTrend: trendPercent(last7Total, prev7Total),
      positive: summary.totals.positive,
      positiveTrend: trendPercent(last7Positive, prev7Positive),
      negative: summary.totals.negative,
      negativeTrend: trendPercent(last7Total - last7Positive, prev7Total - prev7Positive),
      inconclusive: summary.totals.inconclusive,
      inconclusiveTrend: 0,
    };
  }, [summary]);

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
            value={stats?.total ?? 0}
            icon={ClipboardList}
            trend={stats?.totalTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Positive"
            value={stats?.positive ?? 0}
            icon={CheckCircle2}
            tone="positive"
            trend={stats?.positiveTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Negative"
            value={stats?.negative ?? 0}
            icon={XCircle}
            tone="negative"
            trend={stats?.negativeTrend}
            description="vs. previous 7 days"
          />
          <StatCard
            label="Inconclusive"
            value={stats?.inconclusive ?? 0}
            icon={AlertTriangle}
            tone="inconclusive"
            trend={stats?.inconclusiveTrend}
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
