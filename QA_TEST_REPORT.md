# Veriq v4 — Deep QA Report

Date: 4 October 2026

## Automated result

- `npm run check` — PASS
- `npm run qa` — PASS
- `npm run train:risk` on a clean extract — PASS
- `npm test` — PASS
- ML model: `MT-RISK-LOGREG-1.0`
- ML training rows: 900 prototype rows
- Full API phases: 16/16 PASS
- Static/frontend serving: PASS

## Defects fixed

### 1. Unauthenticated protected POST requests

Previously, `requireAuth()` returned `null` without ending the response when no session existed. Protected POST routes could therefore hang until the client timed out.

Now the server returns HTTP 401 with:

`Authentication required`

The QA preflight explicitly tests `/api/risk/recompute` and certificate revocation without a session.

### 2. Clean ML retraining

Previously, `npm run train:risk` failed on a clean extract because `backend/data/veriq.json` had not yet been created by the server.

Now the trainer uses a small deterministic clean-extract bootstrap dataset when the lifecycle JSON is absent. Once the application has created the real lifecycle JSON, subsequent training uses that local dataset.

## Additional consistency fixes

- API health version updated from `3.0.0` to `4.0.0`.
- Removed stale documentation references to `run-tests.bat` and `docs/DEMO_CREDENTIALS.md`.
- Added `backend/qa-preflight.js` and `npm run qa`.
- Corrected offline documentation to describe AES-GCM encrypted browser drafts with an IndexedDB-held encryption key.

## Environment-dependent checks

These are implemented but require a real local browser/device/database for final acceptance:

- live PostgreSQL connectivity
- camera permission and physical QR scanning
- GPS permission and actual coordinates
- service-worker cache behavior after network loss
- offline draft/sync behavior in an actual browser
- mobile responsive rendering on real viewport/device sizes

The automated preflight verifies that the required implementation hooks and static assets are present; it does not falsely claim physical device behavior has been exercised.

## External integrations

DigiLocker, eSign/DSC, eMaap/state portals, payments, SSO and notification delivery remain explicitly demo/adapters where official credentials or authority endpoints are required. The application does not claim those production connections are live.
