import { useEffect, useState } from "react";
import type { ColorMetrics, EvidenceMeta, Gps, QualityTelemetry } from "../api/types";
import { fetchEvidenceImage } from "../api/client";
import { cn } from "../lib/utils";
import { NumberTicker } from "./NumberTicker";

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
    <div className="flex flex-col gap-0.5 py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {objectUrl && (
        <img
          className="aspect-video w-full object-cover"
          src={objectUrl}
          alt={`Captured reaction for test ${testId}`}
        />
      )}
      <dl className={cn("grid grid-cols-2 gap-x-4 divide-y divide-border p-4 [&>*:nth-last-child(-n+2)]:pb-0")}>
        <Item label="Test ID" value={<span className="mono">{testId}</span>} />
        {profileName && <Item label="Kit profile" value={profileName} />}
        {operatorId && <Item label="Operator" value={<span className="mono">{operatorId}</span>} />}
        <Item
          label="Colour"
          value={
            <span className="flex items-center gap-2">
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <span className="mono">{color.hex}</span>
            </span>
          }
        />
        <Item
          label="ΔE positive"
          value={
            typeof color.delta_e_positive === "number" ? (
              <NumberTicker value={color.delta_e_positive} />
            ) : undefined
          }
        />
        <Item
          label="ΔE negative"
          value={
            typeof color.delta_e_negative === "number" ? (
              <NumberTicker value={color.delta_e_negative} />
            ) : undefined
          }
        />
        <Item label="Quality gate" value={quality.passed ? "Passed" : "Failed"} />
        <Item
          label="Blur score"
          value={
            typeof quality.blur_score === "number" ? (
              <NumberTicker value={quality.blur_score} />
            ) : undefined
          }
        />
        <Item label="Exposure" value={quality.exposure_status} />
        <Item label="Glare" value={quality.glare ? "Detected" : "None"} />
        {evidence?.timestamp_utc && (
          <Item label="Timestamp (UTC)" value={<span className="mono">{evidence.timestamp_utc}</span>} />
        )}
        {evidence?.timestamp_local && <Item label="Timestamp (local)" value={evidence.timestamp_local} />}
        {gps && (
          <Item
            label="Location"
            value={
              <>
                {gps.label || "Unknown"}
                <br />
                <span className="mono text-xs text-muted-foreground">
                  {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}
                </span>
              </>
            }
          />
        )}
        {evidence?.image_sha256 && (
          <Item
            label="Image SHA-256"
            value={<span className="mono break-all text-xs">{evidence.image_sha256}</span>}
          />
        )}
      </dl>
    </div>
  );
}
