import { AlertTriangle } from "lucide-react";
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
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Result</h1>
        <p className="mono mt-1 text-sm text-muted-foreground">{result.test_id}</p>
      </div>

      <ResultBadge result={result.result} />

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
