import { useEffect, useState } from "react";
import type { ColorMetrics, EvidenceMeta, Gps, QualityTelemetry } from "../api/types";
import { fetchEvidenceImage } from "../api/client";
import "./EvidenceCard.css";

interface EvidenceCardProps {
  testId: string;
  color: ColorMetrics;
  quality: QualityTelemetry;
  evidence?: Partial<EvidenceMeta> & { gps?: Gps | null };
  operatorId?: string;
  profileName?: string;
  imageUrl?: string;
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="evidence-card__item">
      <dt className="evidence-card__label">{label}</dt>
      <dd className="evidence-card__value">{value}</dd>
    </div>
  );
}

export function EvidenceCard({
  testId,
  color,
  quality,
  evidence,
  operatorId,
  profileName,
  imageUrl,
}: EvidenceCardProps) {
  const gps = evidence?.gps ?? null;

  // Evidence images sit behind the Bearer guard; fetch with auth into an object URL.
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!imageUrl) return;
    let revoked = false;
    let created: string | null = null;
    fetchEvidenceImage(imageUrl)
      .then((url) => {
        if (revoked) {
          URL.revokeObjectURL(url);
          return;
        }
        created = url;
        setObjectUrl(url);
      })
      .catch(() => setObjectUrl(null));
    return () => {
      revoked = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [imageUrl]);

  return (
    <div className="card evidence-card">
      {objectUrl && (
        <img
          className="evidence-card__image"
          src={objectUrl}
          alt={`Captured reaction for test ${testId}`}
        />
      )}
      <dl className="evidence-card__grid">
        <Item label="Test ID" value={<span className="mono">{testId}</span>} />
        {profileName && <Item label="Kit profile" value={profileName} />}
        {operatorId && <Item label="Operator" value={<span className="mono">{operatorId}</span>} />}
        <Item
          label="Colour"
          value={
            <span className="evidence-card__swatch-wrap">
              <span
                className="evidence-card__swatch"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <span className="mono">{color.hex}</span>
            </span>
          }
        />
        <Item label="ΔE positive" value={color.delta_e_positive?.toFixed(1)} />
        <Item label="ΔE negative" value={color.delta_e_negative?.toFixed(1)} />
        <Item
          label="Quality gate"
          value={quality.passed ? "Passed" : "Failed"}
        />
        <Item label="Blur score" value={quality.blur_score?.toFixed(1)} />
        <Item label="Exposure" value={quality.exposure_status} />
        <Item label="Glare" value={quality.glare ? "Detected" : "None"} />
        {evidence?.timestamp_utc && (
          <Item label="Timestamp (UTC)" value={<span className="mono">{evidence.timestamp_utc}</span>} />
        )}
        {evidence?.timestamp_local && (
          <Item label="Timestamp (local)" value={evidence.timestamp_local} />
        )}
        {gps && (
          <Item
            label="Location"
            value={
              <>
                {gps.label || "Unknown"}
                <br />
                <span className="mono text-sm">
                  {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}
                </span>
              </>
            }
          />
        )}
        {evidence?.image_sha256 && (
          <Item
            label="Image SHA-256"
            value={<span className="mono evidence-card__hash">{evidence.image_sha256}</span>}
          />
        )}
      </dl>
    </div>
  );
}
