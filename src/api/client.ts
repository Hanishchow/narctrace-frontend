// The ONLY module that reads import.meta.env.VITE_API_BASE.
// Every call prefixes `${VITE_API_BASE}/api` (PRD §3 port contract, §4 API contract).

import type {
  AnalysisResult,
  AnalyticsSummary,
  AnalyzePayload,
  CapturePreview,
  EvidenceVerification,
  CaseListResponse,
  CaseResponse,
  FieldCase,
  HealthResponse,
  HistoryDetailResponse,
  HistoryResponse,
  LoginResponse,
  ProfilesResponse,
  ResultClass,
} from "./types";

const configuredApiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
const API_BASE = configuredApiBase.replace(/\/+$/, "");
const API_PREFIX = `${API_BASE}/api`;

export class ApiError extends Error {
  status: number;
  // Raw `detail` from the backend. For a quality-gate rejection (HTTP 422) this
  // is a structured object ({success,reason,quality,issues,disclaimer}), not a
  // string — callers should inspect it to render recapture guidance.
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// --- Token store: in-memory + sessionStorage (cleared on tab close). ---
const TOKEN_KEY = "narctrace.token";
let inMemoryToken: string | null = null;

export function setToken(token: string | null): void {
  inMemoryToken = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sessionStorage may be unavailable; in-memory still works */
  }
}

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    inMemoryToken = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    inMemoryToken = null;
  }
  return inMemoryToken;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Sent on every request. Both headers defeat tunnel interstitial pages that would
// otherwise replace our JSON with HTML: `ngrok-skip-browser-warning` for ngrok,
// `bypass-tunnel-reminder` for localtunnel (.loca.lt). Harmless on other hosts.
function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "ngrok-skip-browser-warning": "true",
    "bypass-tunnel-reminder": "true",
    ...authHeaders(),
    ...extra,
  };
}

function requestInit(init: RequestInit = {}): RequestInit {
  return { credentials: "omit", ...init };
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
  }
  if (!res.ok) {
    const rawDetail =
      body && typeof body === "object" && "detail" in body
        ? (body as { detail: unknown }).detail
        : undefined;
    let message: string;
    if (typeof rawDetail === "string") {
      message = rawDetail;
    } else if (rawDetail && typeof rawDetail === "object" && "reason" in rawDetail) {
      message = String((rawDetail as { reason: unknown }).reason);
    } else {
      message = res.statusText || "Request failed";
    }
    throw new ApiError(message, res.status, rawDetail);
  }
  return body as T;
}

// --- Endpoints (PRD §4) ---

export function health(): Promise<HealthResponse> {
  return fetch(`${API_PREFIX}/health`, requestInit({ headers: headers() })).then((r) => parseJson<HealthResponse>(r));
}

export function login(badge_id: string, password: string): Promise<LoginResponse> {
  return fetch(`${API_PREFIX}/auth/login`, requestInit({
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ badge_id, password }),
  })).then((r) => parseJson<LoginResponse>(r));
}

export function getProfiles(): Promise<ProfilesResponse> {
  return fetch(`${API_PREFIX}/profiles`, requestInit({ headers: headers() })).then((r) =>
    parseJson<ProfilesResponse>(r),
  );
}

export function analyze(payload: AnalyzePayload): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("image", payload.image, `${payload.profile_id}.jpg`);
  form.append("profile_id", payload.profile_id);
  form.append("operator_id", payload.operator_id);
  form.append("gps", JSON.stringify(payload.gps));
  if (payload.case_id) form.append("case_id", payload.case_id);
  return fetch(`${API_PREFIX}/analyze`, requestInit({
    method: "POST",
    headers: headers({ "Idempotency-Key": payload.idempotency_key }), // do NOT set Content-Type; browser sets multipart boundary
    body: form,
  })).then((r) => parseJson<AnalysisResult>(r));
}

export function previewCapture(image: Blob, profileId: string): Promise<CapturePreview> {
  const form = new FormData();
  form.append("image", image, `${profileId}-preview.jpg`);
  form.append("profile_id", profileId);
  return fetch(`${API_PREFIX}/capture-preview`, requestInit({
    method: "POST",
    headers: headers(),
    body: form,
  })).then((r) => parseJson<CapturePreview>(r));
}

export interface HistoryFilters {
  query?: string;
  result?: ResultClass | "";
  profile?: string;
}

export function getHistory(filters: HistoryFilters = {}): Promise<HistoryResponse> {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.result) params.set("result", filters.result);
  if (filters.profile) params.set("profile", filters.profile);
  const qs = params.toString();
  return fetch(`${API_PREFIX}/history${qs ? `?${qs}` : ""}`, requestInit({
    headers: headers(),
  })).then((r) => parseJson<HistoryResponse>(r));
}

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return fetch(`${API_PREFIX}/analytics/summary`, requestInit({ headers: headers() })).then((r) =>
    parseJson<AnalyticsSummary>(r),
  );
}

export function getHistoryDetail(testId: string): Promise<HistoryDetailResponse> {
  return fetch(`${API_PREFIX}/history/${encodeURIComponent(testId)}`, requestInit({
    headers: headers(),
  })).then((r) => parseJson<HistoryDetailResponse>(r));
}

export function verifyEvidence(testId: string): Promise<EvidenceVerification> {
  return fetch(`${API_PREFIX}/history/${encodeURIComponent(testId)}/verify`, requestInit({
    headers: headers(),
  })).then((r) => parseJson<EvidenceVerification>(r));
}

export function getCases(): Promise<CaseListResponse> {
  return fetch(`${API_PREFIX}/v2/cases`, requestInit({ headers: headers() })).then((r) => parseJson<CaseListResponse>(r));
}

export function createCase(reference: string, title: string): Promise<CaseResponse> {
  return fetch(`${API_PREFIX}/v2/cases`, requestInit({
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reference, title }),
  })).then((r) => parseJson<CaseResponse>(r));
}

export function transitionCase(fieldCase: FieldCase, action: string): Promise<CaseResponse> {
  return fetch(`${API_PREFIX}/v2/cases/${encodeURIComponent(fieldCase.case_id)}/events`, requestInit({
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ action, expected_version: fieldCase.version }),
  })).then((r) => parseJson<CaseResponse>(r));
}

export function addLabReport(fieldCase: FieldCase, laboratory: string, outcome: string, report_reference: string): Promise<CaseResponse> {
  return fetch(`${API_PREFIX}/v2/cases/${encodeURIComponent(fieldCase.case_id)}/lab-reports`, requestInit({
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ laboratory, outcome, report_reference }),
  })).then((r) => parseJson<CaseResponse>(r));
}

// Evidence images are served behind the Bearer guard, so an <img src> cannot
// load them directly (it can't send the Authorization header, and a relative
// path resolves against the frontend origin). Fetch the bytes with auth and
// return an object URL the caller assigns to <img> (and revokes on unmount).
export async function fetchEvidenceImage(imageUrl: string): Promise<string> {
  const full = /^https?:\/\//.test(imageUrl)
    ? imageUrl
    : `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  if (new URL(full).origin !== new URL(API_BASE).origin) {
    throw new ApiError("Evidence URL is outside the configured API origin", 400);
  }
  const res = await fetch(full, requestInit({ headers: headers() }));
  if (!res.ok) throw new ApiError("Failed to load evidence image", res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export { API_BASE, API_PREFIX };
