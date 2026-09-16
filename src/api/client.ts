// The ONLY module that reads import.meta.env.VITE_API_BASE.
// Every call prefixes `${VITE_API_BASE}/api` (PRD §3 port contract, §4 API contract).

import type {
  AnalysisResult,
  AnalyticsSummary,
  AnalyzePayload,
  HealthResponse,
  HistoryDetailResponse,
  HistoryResponse,
  LoginResponse,
  ProfilesResponse,
  ResultClass,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
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
  return fetch(`${API_PREFIX}/health`, { headers: headers() }).then((r) => parseJson<HealthResponse>(r));
}

export function login(badge_id: string, password: string): Promise<LoginResponse> {
  return fetch(`${API_PREFIX}/auth/login`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ badge_id, password }),
  }).then((r) => parseJson<LoginResponse>(r));
}

export function getProfiles(): Promise<ProfilesResponse> {
  return fetch(`${API_PREFIX}/profiles`, { headers: headers() }).then((r) =>
    parseJson<ProfilesResponse>(r),
  );
}

export function analyze(payload: AnalyzePayload): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("image", payload.image, `${payload.profile_id}.jpg`);
  form.append("profile_id", payload.profile_id);
  form.append("operator_id", payload.operator_id);
  form.append("gps", JSON.stringify(payload.gps));
  return fetch(`${API_PREFIX}/analyze`, {
    method: "POST",
    headers: headers(), // do NOT set Content-Type; browser sets multipart boundary
    body: form,
  }).then((r) => parseJson<AnalysisResult>(r));
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
  return fetch(`${API_PREFIX}/history${qs ? `?${qs}` : ""}`, {
    headers: headers(),
  }).then((r) => parseJson<HistoryResponse>(r));
}

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return fetch(`${API_PREFIX}/analytics/summary`, { headers: headers() }).then((r) =>
    parseJson<AnalyticsSummary>(r),
  );
}

export function getHistoryDetail(testId: string): Promise<HistoryDetailResponse> {
  return fetch(`${API_PREFIX}/history/${encodeURIComponent(testId)}`, {
    headers: headers(),
  }).then((r) => parseJson<HistoryDetailResponse>(r));
}

// Evidence images are served behind the Bearer guard, so an <img src> cannot
// load them directly (it can't send the Authorization header, and a relative
// path resolves against the frontend origin). Fetch the bytes with auth and
// return an object URL the caller assigns to <img> (and revokes on unmount).
export async function fetchEvidenceImage(imageUrl: string): Promise<string> {
  const full = /^https?:\/\//.test(imageUrl)
    ? imageUrl
    : `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  const res = await fetch(full, { headers: headers() });
  if (!res.ok) throw new ApiError("Failed to load evidence image", res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export { API_BASE, API_PREFIX };
