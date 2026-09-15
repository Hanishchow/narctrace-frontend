import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

// Static illustrative mockup of the officer dashboard for the landing page
// hero — built from the app's real tokens/result colours, not a screenshot,
// so it stays in sync with the actual product visually.
export function DashboardPreview() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card md:rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">NarcTrace</span>
        </div>
        <span className="mono hidden text-xs text-muted-foreground sm:inline">FT-00042</span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-5 sm:gap-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-positive/30 bg-positive-bg px-4 py-6">
            <CheckCircle2 className="h-6 w-6 text-positive" strokeWidth={2.25} />
            <span className="text-xl font-bold tracking-tight text-positive">Positive</span>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Kit profile</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">Alpha — Purple proxy</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground" />
            <p className="text-xs text-muted-foreground">New Delhi, Delhi</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Evidence record</p>
          <div className="flex flex-1 flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
            {[
              ["Test ID", "FT-00042"],
              ["Colour", "#6D28D9"],
              ["ΔE positive", "2.8"],
              ["ΔE negative", "38.4"],
              ["Quality gate", "Passed"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="mono text-xs font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
