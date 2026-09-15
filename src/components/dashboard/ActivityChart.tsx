import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EvidenceRecord } from "../../api/types";

interface ActivityChartProps {
  records: EvidenceRecord[];
}

interface DayBucket {
  date: string;
  label: string;
  Positive: number;
  Negative: number;
  Inconclusive: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityChart({ records }: ActivityChartProps) {
  const data = useMemo<DayBucket[]>(() => {
    const buckets = new Map<string, DayBucket>();
    for (const rec of records) {
      const d = new Date(rec.timestamp_utc);
      const key = d.toISOString().slice(0, 10);
      if (!buckets.has(key)) {
        buckets.set(key, {
          date: key,
          label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          Positive: 0,
          Negative: 0,
          Inconclusive: 0,
        });
      }
      const bucket = buckets.get(key)!;
      bucket[rec.result] += 1;
    }
    return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Test activity</h3>
        <p className="text-xs text-muted-foreground">Daily results over the last 30 days</p>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--positive))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--positive))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--negative))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--negative))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillInconclusive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--inconclusive))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--inconclusive))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
            <Area
              type="monotone"
              dataKey="Positive"
              stackId="1"
              stroke="hsl(var(--positive))"
              fill="url(#fillPositive)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="Negative"
              stackId="1"
              stroke="hsl(var(--negative))"
              fill="url(#fillNegative)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="Inconclusive"
              stackId="1"
              stroke="hsl(var(--inconclusive))"
              fill="url(#fillInconclusive)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
