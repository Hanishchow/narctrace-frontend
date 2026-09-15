// Demo-mode fixtures used ONLY when the real backend (src/api/client.ts) is
// unreachable, so the UI can be clicked through end-to-end offline. None of
// this touches src/api/ — it is a parallel, clearly-labelled fallback path
// wired from LoginScreen/App only. Swap-in/out has zero effect on the real
// contract once a backend is running.

import type {
  AnalysisResult,
  AnalyzePayload,
  EvidenceRecord,
  Gps,
  KitProfile,
  Officer,
  ResultClass,
} from "../api/types";

export const MOCK_PROFILES: KitProfile[] = [
  { profile_id: "SIM-PROFILE-ALPHA", name: "Alpha — Purple proxy", version: "1.2.0" },
  { profile_id: "SIM-PROFILE-BETA", name: "Beta — Cobalt Blue proxy", version: "1.0.3" },
];

const DEMO_DISCLAIMER =
  "PRESUMPTIVE FIELD-TEST RESULT ONLY. This software does not replace laboratory " +
  "confirmatory testing. All kit profiles, thresholds and target colour values are " +
  "SIMULATED / PROXY values for safe demonstration.";

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

let counter = 42;
function nextTestId() {
  counter += 1;
  return `FT-${pad(counter, 5)}`;
}

export function mockLogin(badgeId: string): Officer {
  return {
    id: "demo-officer-1",
    name: "Demo Officer",
    badge_id: badgeId || "FIELD-OP-01",
  };
}

const RESULT_POOL: { result: ResultClass; hex: string; dp: number; dn: number }[] = [
  { result: "Positive", hex: "#6d28d9", dp: 2.8, dn: 38.4 },
  { result: "Negative", hex: "#c7c2ba", dp: 41.2, dn: 3.1 },
  { result: "Inconclusive", hex: "#8b6fae", dp: 11.4, dn: 12.9 },
];

export function mockAnalyze(payload: AnalyzePayload): Promise<AnalysisResult> {
  const pick = RESULT_POOL[Math.floor(Math.random() * RESULT_POOL.length)];
  const now = new Date();
  const testId = nextTestId();
  const result: AnalysisResult = {
    success: true,
    test_id: testId,
    result: pick.result,
    quality: {
      passed: true,
      blur_score: 118 + Math.round(Math.random() * 40),
      exposure_status: "normal",
      glare: false,
    },
    color: {
      hex: pick.hex,
      lab: [52.3, 24.1, -38.7],
      delta_e_positive: pick.dp,
      delta_e_negative: pick.dn,
    },
    profile: MOCK_PROFILES.find((p) => p.profile_id === payload.profile_id) ?? MOCK_PROFILES[0],
    evidence: {
      timestamp_utc: now.toISOString(),
      timestamp_local: now.toLocaleString(),
      operator_id: payload.operator_id,
      gps: payload.gps,
      image_sha256: Array.from({ length: 64 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)],
      ).join(""),
      image_url: "",
    },
    disclaimer: DEMO_DISCLAIMER,
  };
  mockHistory.unshift(toRecord(result));
  return new Promise((resolve) => setTimeout(() => resolve(result), 900));
}

function toRecord(r: AnalysisResult): EvidenceRecord {
  return {
    id: r.test_id,
    test_id: r.test_id,
    operator_id: r.evidence.operator_id,
    result: r.result,
    profile_id: r.profile.profile_id,
    timestamp_utc: r.evidence.timestamp_utc,
    timestamp_local: r.evidence.timestamp_local,
    gps: r.evidence.gps,
    color: r.color,
    quality: r.quality,
    image_sha256: r.evidence.image_sha256,
    image_path: "",
    image_url: r.evidence.image_url,
    created_at: r.evidence.timestamp_utc,
  };
}

// Generates a larger, date-spread set of demo records purely for the
// Overview dashboard's chart/table, so they have enough volume to render
// meaningfully. Deterministic (seeded by index) so it doesn't reshuffle
// on every render.
function generateDashboardHistory(days: number): EvidenceRecord[] {
  const operators = ["FIELD-OP-01", "FIELD-OP-02", "FIELD-OP-03"];
  const out: EvidenceRecord[] = [];
  let id = 100;
  for (let d = days; d >= 0; d--) {
    const testsToday = 1 + ((d * 7) % 4); // 1–4 tests/day, deterministic
    for (let t = 0; t < testsToday; t++) {
      id += 1;
      const pick = RESULT_POOL[(d + t) % RESULT_POOL.length];
      const when = new Date(Date.now() - d * 86_400_000 - t * 3_600_000);
      out.push(
        toRecord({
          success: true,
          test_id: `FT-${pad(id, 5)}`,
          result: pick.result,
          quality: {
            passed: (d + t) % 5 !== 0,
            blur_score: 95 + ((d * 13 + t * 7) % 60),
            exposure_status: (d + t) % 7 === 0 ? "overexposed" : "normal",
            glare: (d + t) % 9 === 0,
          },
          color: { hex: pick.hex, lab: [50, 20, -30], delta_e_positive: pick.dp, delta_e_negative: pick.dn },
          profile: MOCK_PROFILES[(d + t) % MOCK_PROFILES.length],
          evidence: {
            timestamp_utc: when.toISOString(),
            timestamp_local: when.toLocaleString(),
            operator_id: operators[(d + t) % operators.length],
            gps: seedGps,
            image_sha256: Array.from({ length: 64 }, (_, k) => "0123456789abcdef"[(d + t + k) % 16]).join(""),
            image_url: "",
          },
          disclaimer: DEMO_DISCLAIMER,
        }),
      );
    }
  }
  return out.reverse();
}

const seedGps: Gps = { lat: 28.6139, lon: 77.209, label: "New Delhi, Delhi" };

// Larger dataset for the Overview dashboard's chart + table (last 30 days).
export const mockDashboardHistory: EvidenceRecord[] = generateDashboardHistory(30);

// Seed a few demo records so History isn't empty on first visit.
export const mockHistory: EvidenceRecord[] = [
  toRecord({
    success: true,
    test_id: "FT-00039",
    result: "Positive",
    quality: { passed: true, blur_score: 132.5, exposure_status: "normal", glare: false },
    color: { hex: "#6d28d9", lab: [48, 30, -40], delta_e_positive: 2.4, delta_e_negative: 39.8 },
    profile: MOCK_PROFILES[0],
    evidence: {
      timestamp_utc: new Date(Date.now() - 3600_000 * 6).toISOString(),
      timestamp_local: new Date(Date.now() - 3600_000 * 6).toLocaleString(),
      operator_id: "FIELD-OP-01",
      gps: seedGps,
      image_sha256: "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff",
      image_url: "",
    },
    disclaimer: DEMO_DISCLAIMER,
  }),
  toRecord({
    success: true,
    test_id: "FT-00040",
    result: "Negative",
    quality: { passed: true, blur_score: 140.1, exposure_status: "normal", glare: false },
    color: { hex: "#c7c2ba", lab: [70, 2, -3], delta_e_positive: 40.1, delta_e_negative: 2.9 },
    profile: MOCK_PROFILES[1],
    evidence: {
      timestamp_utc: new Date(Date.now() - 3600_000 * 20).toISOString(),
      timestamp_local: new Date(Date.now() - 3600_000 * 20).toLocaleString(),
      operator_id: "FIELD-OP-01",
      gps: seedGps,
      image_sha256: "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221",
      image_url: "",
    },
    disclaimer: DEMO_DISCLAIMER,
  }),
  toRecord({
    success: true,
    test_id: "FT-00041",
    result: "Inconclusive",
    quality: { passed: false, blur_score: 68.3, exposure_status: "overexposed", glare: true },
    color: { hex: "#8b6fae", lab: [55, 18, -22], delta_e_positive: 11.9, delta_e_negative: 13.2 },
    profile: MOCK_PROFILES[0],
    evidence: {
      timestamp_utc: new Date(Date.now() - 3600_000 * 30).toISOString(),
      timestamp_local: new Date(Date.now() - 3600_000 * 30).toLocaleString(),
      operator_id: "FIELD-OP-02",
      gps: null,
      image_sha256: "0011223344556677889900aabbccddeeff00112233445566778899aabbccd",
      image_url: "",
    },
    disclaimer: DEMO_DISCLAIMER,
  }),
];
