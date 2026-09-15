// Persistent presumptive-only disclaimer (PRD §7 principle 3 — never dismissible).

const DEFAULT_TEXT =
  "PRESUMPTIVE FIELD-TEST RESULT ONLY. This software does not replace laboratory " +
  "confirmatory testing. All kit profiles, thresholds and target colour values are " +
  "SIMULATED / PROXY values for safe demonstration.";

export function Disclaimer({ text }: { text?: string }) {
  return (
    <footer role="note" className="border-t border-border px-4 py-3 lg:px-10">
      <p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
        <span className="font-semibold text-foreground">Disclaimer.</span> {text ?? DEFAULT_TEXT}
      </p>
    </footer>
  );
}
