// Types mirroring the PRD §4 API contract exactly.

export type ResultClass = "Positive" | "Negative" | "Inconclusive";

export interface Officer {
  id: string;
  name: string;
  badge_id: string;
}

export interface LoginResponse {
  token: string;
  officer: Officer;
}

export interface KitProfile {
  profile_id: string;
  name: string;
  version: string;
}

export interface ProfilesResponse {
  success: boolean;
  profiles: KitProfile[];
}

export interface HealthResponse {
  status: string;
  version?: string;
}

export interface Gps {
  lat: number;
  lon: number;
  label: string;
}

export interface QualityTelemetry {
  passed: boolean;
  blur_score: number;
  exposure_status: string;
  glare: boolean;
}

export interface ColorMetrics {
  hex: string;
  lab: number[];
  delta_e_positive: number;
  delta_e_negative: number;
}

export interface EvidenceMeta {
  timestamp_utc: string;
  timestamp_local: string;
  operator_id: string;
  gps: Gps | null;
  image_sha256: string;
  image_url: string;
}

// POST /api/analyze response.
export interface AnalysisResult {
  success: boolean;
  test_id: string;
  result: ResultClass;
  quality: QualityTelemetry;
  color: ColorMetrics;
  profile: KitProfile;
  evidence: EvidenceMeta;
  disclaimer: string;
}

// Stored evidence record (history rows / detail). Mirrors §6 table + jsonb blobs.
export interface EvidenceRecord {
  id: string;
  test_id: string;
  operator_id: string;
  result: ResultClass;
  profile_id: string;
  timestamp_utc: string;
  timestamp_local: string;
  gps: Gps | null;
  color: ColorMetrics;
  quality: QualityTelemetry;
  image_sha256: string;
  image_path: string;
  image_url?: string;
  created_at: string;
}

export interface HistoryResponse {
  success: boolean;
  count: number;
  records: EvidenceRecord[];
}

export interface HistoryDetailResponse {
  success: boolean;
  record: EvidenceRecord;
}

// Payload the Capture screen assembles for POST /api/analyze.
export interface AnalyzePayload {
  image: Blob;
  profile_id: string;
  operator_id: string;
  gps: Gps | null;
}
