# narctrace-frontend

Officer-facing client for **NarcTrace** — the field drug-testing digital companion
(SIH26231). React 18 + Vite + TypeScript. It guides an officer through kit selection,
GPS capture, camera capture of the reagent reaction, and shows a **presumptive**
Positive / Negative / Inconclusive result plus a tamper-evident evidence record and
searchable history.

> **PRESUMPTIVE FIELD-TEST RESULT ONLY.** This software does not replace laboratory
> confirmatory testing. All kit profiles, thresholds and target colour values are
> SIMULATED / PROXY values for safe demonstration.

## Run

```bash
npm install
npm run dev            # → http://localhost:5173
```

The dev server is pinned to **port 5173** (`vite.config.ts`, `strictPort`). This origin
must be present in the backend `CORS_ORIGINS`.

### Requires the backend

This client talks to the **narctrace-backend** (FastAPI) on **port 8000**. Start it first.
On boot the app pings `GET /api/health`; if the backend is down a persistent
**"Backend unreachable"** banner is shown and login/analysis are disabled.

Camera capture needs a secure context — use `http://localhost:5173` (localhost is treated
as secure) or serve over HTTPS.

## Environment

Copy `.env.example` to `.env.local` and adjust if needed:

| Variable | Default | Meaning |
|----------|---------|---------|
| `VITE_API_BASE` | `http://localhost:8000` | Backend origin. Every request targets `${VITE_API_BASE}/api`. In prod set to the deployed backend HTTPS URL. |

`src/api/client.ts` is the **only** place that reads `VITE_API_BASE`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server on 5173 |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build |
| `npm run check:ports` | Verify the frontend/backend `.env.example` ports agree (PRD §3 contract) |

## Structure

```
src/
  api/client.ts      single API client (reads VITE_API_BASE, prefixes /api, Bearer auth)
  api/types.ts       types mirroring the PRD §4 contract
  lib/geo.ts         Geolocation + OpenStreetMap Nominatim reverse geocode (no key)
  components/        Button, Field, ResultBadge, EvidenceCard, CameraFrame, HistoryRow, Disclaimer
  screens/           Login, StartTest, Capture, Result, History (one task per screen)
  styles/tokens.css  all design tokens — no component hard-codes a colour hex
  styles/global.css  base layout + shared utilities
```

## Design

Deliberately simple v1 (PRD §7): system font stack, one soft elevation, 44px min tap
targets, WCAG AA, `prefers-reduced-motion` respected. Result is shown unmistakably
(32px badge, colour + icon + text, never colour alone). All colours come from
`src/styles/tokens.css` so the later professional redesign only swaps tokens.
