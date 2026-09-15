import { ShieldAlert } from "lucide-react";

// Persistent presumptive-only disclaimer (PRD §7 principle 3 — never dismissible).

const DEFAULT_TEXT =
  "PRESUMPTIVE FIELD-TEST RESULT ONLY. This software does not replace laboratory " +
  "confirmatory testing. All kit profiles, thresholds and target colour values are " +
  "SIMULATED / PROXY values for safe demonstration.";

export function Disclaimer({ text }: { text?: string }) {
  return (
    <footer role="note" className="border-t border-border bg-muted px-4 py-3">
      <p className="mx-auto flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-foreground">Disclaimer:</strong> {text ?? DEFAULT_TEXT}
        </span>
      </p>
    </footer>
  );
}
