import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { NumberTicker } from "../NumberTicker";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative" | "inconclusive";
  description?: string;
  trend?: number;
}

const TONE_TEXT: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-positive",
  negative: "text-negative",
  inconclusive: "text-inconclusive",
};

export function StatCard({ label, value, icon: Icon, tone = "default", description, trend }: StatCardProps) {
  const showTrend = typeof trend === "number";
  const TrendIcon = trend && trend < 0 ? TrendingDown : TrendingUp;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", TONE_TEXT[tone])} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className={cn("text-3xl font-bold tracking-tight", TONE_TEXT[tone])}>
          <NumberTicker value={value} decimals={0} />
        </p>
        {showTrend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend! >= 0 ? "text-positive" : "text-destructive",
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {Math.abs(trend!)}%
          </span>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
