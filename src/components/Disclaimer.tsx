// Persistent presumptive-only disclaimer (PRD §7 principle 3 — never dismissible).

const DEFAULT_TEXT =
  "PRESUMPTIVE FIELD-TEST RESULT ONLY. This software does not replace laboratory " +
  "confirmatory testing. All kit profiles, thresholds and target colour values are " +
  "SIMULATED / PROXY values for safe demonstration.";

export function Disclaimer({ text }: { text?: string }) {
  return (
    <footer className="disclaimer" role="note">
      <strong>Disclaimer:</strong> {text ?? DEFAULT_TEXT}
    </footer>
  );
}
