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
  case_id?: string;
  image_sha256: string;
  image_url: string;
}

export interface AnalysisExplanation {
  method: string;
  summary: string;
  pipeline_version: string;
  classification_rule: string;
}

export interface CapturePreview {
  success: boolean;
  card_detected: boolean;
  guidance: string;
  quality: QualityTelemetry & { issues: string[] };
}

export interface EvidenceVerification {
  success: boolean;
  test_id: string;
  valid: boolean;
  expected_sha256?: string;
  reason: string;
}

export type CaseStatus = "open" | "submitted" | "received_by_lab" | "reviewed" | "closed";

export interface CustodyEvent {
  sequence: number;
  action: string;
  actor_id: string;
  created_at: string;
}

export interface FieldCase {
  case_id: string;
  reference: string;
  title: string;
  status: CaseStatus;
  version: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  events?: CustodyEvent[];
  lab_reports?: LabReport[];
  evidence_test_ids?: string[];
}

export interface LabReport {
  report_id: string;
  laboratory: string;
  outcome: string;
  report_reference: string;
  actor_id: string;
  created_at: string;
}

export interface CaseListResponse {
  success: boolean;
  cases: FieldCase[];
}

export interface CaseResponse {
  success: boolean;
  case: FieldCase;
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
  explanation: AnalysisExplanation;
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
  case_id?: string;
  idempotency_key: string;
}

// GET /api/analytics/summary (PRD v2 Track C) — presentation dashboard stats.
export interface AnalyticsSummary {
  success: boolean;
  totals: {
    total: number;
    positive: number;
    negative: number;
    inconclusive: number;
    quality_rejected: number;
  };
  rates: {
    positive_rate: number;
    negative_rate: number;
    inconclusive_rate: number;
  };
  by_profile: { profile_id: string; count: number }[];
  by_day: { date: string; count: number; positive: number }[];
  by_operator: { operator_id: string; count: number }[];
}

