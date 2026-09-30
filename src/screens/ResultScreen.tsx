import { AlertTriangle, Beaker, CheckCircle2, Fingerprint } from "lucide-react";
import type { AnalysisResult } from "../api/types";
import { ResultBadge } from "../components/ResultBadge";
import { EvidenceCard } from "../components/EvidenceCard";
import { Button } from "../components/Button";

interface ResultScreenProps {
  result: AnalysisResult;
  onNewTest: () => void;
  onViewHistory: () => void;
}

export function ResultScreen({ result, onNewTest, onViewHistory }: ResultScreenProps) {
  // Older saved demo fixtures predate the explanation block. Preserve their
  // readability while every new backend response supplies the richer record.
  const explanation = result.explanation ?? {
    method: "Reference-card calibrated colour comparison",
    summary: "This saved demonstration record does not include a detailed rule trace.",
    pipeline_version: "legacy-demo",
    classification_rule: "Recorded result",
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Result</h1>
        <p className="mono mt-1 text-sm text-muted-foreground">{result.test_id}</p>
      </div>

      <ResultBadge result={result.result} />

      <section className="measurement-rail rounded-r-xl bg-card px-5 py-5 shadow-[0_12px_30px_hsl(160_20%_12%/0.06)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-strong">
            <Beaker className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Why this result</p>
            <p className="mt-1 text-sm leading-6">{explanation.summary}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-muted/70 p-3">
            <p className="text-xs font-medium text-muted-foreground">Measurement method</p>
            <p className="mt-1 font-medium">{explanation.method}</p>
          </div>
          <div className="rounded-lg bg-muted/70 p-3">
            <p className="text-xs font-medium text-muted-foreground">Pipeline</p>
            <p className="mono mt-1 font-medium">{explanation.pipeline_version}</p>
          </div>
        </div>
      </section>

      {!result.quality.passed && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg bg-inconclusive-bg px-4 py-3 text-sm font-medium text-inconclusive"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Quality gate failed — result may be unreliable. Consider re-capturing.
        </p>
      )}

      <EvidenceCard
        testId={result.test_id}
        color={result.color}
        quality={result.quality}
        evidence={result.evidence}
        operatorId={result.evidence.operator_id}
        profileName={result.profile.name}
        imageUrl={result.evidence.image_url}
      />

      <section className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
        <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-accent-strong" aria-hidden="true" />
        <div>
          <p className="font-semibold">Evidence receipt recorded</p>
          <p className="mt-1 leading-6 text-muted-foreground">
            The original image is linked to this record with SHA-256. The result remains a presumptive field observation and requires confirmatory testing where policy requires it.
          </p>
        </div>
        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-positive" aria-hidden="true" />
      </section>

      <div className="flex flex-col gap-3">
        <Button block onClick={onNewTest}>
          Start a new test
        </Button>
        <Button variant="secondary" block onClick={onViewHistory}>
          View history
        </Button>
      </div>
    </>
  );
}
