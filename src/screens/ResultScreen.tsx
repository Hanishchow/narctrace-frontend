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
        <h1 className="screen-title">Result</h1>
        <p className="screen-subtitle mono">{result.test_id}</p>
      </div>

      <ResultBadge result={result.result} />

      {!result.quality.passed && (
        <p className="banner banner--warn" role="status" style={{ borderRadius: "var(--radius-control)" }}>
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

      <div className="stack">
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
