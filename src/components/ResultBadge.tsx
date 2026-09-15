import type { ResultClass } from "../api/types";
import "./ResultBadge.css";

// Result must be unmistakable: large 32px type + colour + icon + text.
// Colour is NEVER the sole signal (WCAG / PRD §7).

const ICON: Record<ResultClass, string> = {
  Positive: "M20 6 9 17l-5-5", // check
  Negative: "M18 6 6 18M6 6l12 12", // cross
  Inconclusive: "M12 9v4m0 4h.01", // alert (dashes handled below)
};

function ResultIcon({ result }: { result: ResultClass }) {
  if (result === "Inconclusive") {
    return (
      <svg
        className="result-badge__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 9v4m0 4h.01"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="result-badge__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {result === "Positive" && (
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      {result === "Negative" && (
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      <path
        d={ICON[result]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ResultBadge({ result }: { result: ResultClass }) {
  const modifier = result.toLowerCase();
  return (
    <div
      className={`result-badge result-badge--${modifier}`}
      role="status"
      aria-label={`Test result: ${result}`}
    >
      <ResultIcon result={result} />
      <span className="result-badge__text">{result}</span>
    </div>
  );
}
