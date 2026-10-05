# Veriq Test Report

Date: 30 September 2026

## Phase-by-phase automated API test

The test suite is intentionally sequential. If any phase fails, execution stops and later phases are not counted as passed.

1. Server health and startup — PASS
2. Authentication, role isolation and CSRF — PASS
3. Instrument + application lifecycle — PASS
4. Rule-aware scheduling + inspection start — PASS
5. Inspection + evidence + certificate + QR check — PASS
6. Public trust chain + serial mismatch/anti-clone — PASS
7. Complaints + feedback + repairs + relocation + fraud signals — PASS
8. Admin + rules + GATC + reports — PASS
9. Certificate revocation — PASS
10. Re-verification + certificate versioning — PASS
11. Notifications + audit retrieval/hash chain — PASS
12. Ed25519 trust + evidence download + integrations + GATC standards + owner feedback + reinspection + renewal — PASS
13. Admin controls + GATC lifecycle + rule simulation + fraud graph + scan analytics + privacy + duplicate-evidence detection — PASS
14. Expiry automation + jurisdiction enforcement — PASS
15. GATC editing + capacity reservation/release + public complaint evidence + session expiry — PASS
16. CSRF + privacy + serial uniqueness + audit-chain invariants — PASS

Final result:

```text
ALL API PHASES PASS
STATIC/FRONTEND SERVING PASS
```

## Static/frontend validation

- `node --check backend/server.js` — PASS
- `node --check frontend/app.js` — PASS
- `node --check backend/full-system-test.js` — PASS
- `node --check backend/static-test.js` — PASS
- Static serving test for `/`, `/index.html`, `/app.js`, `/styles.css` — PASS
- Direct event-handler function consistency scan — PASS

## External-service limitation

Production government integrations (DigiLocker issuer credentials, eSign/DSC provider access, eMaap/state APIs, departmental SSO and real payment/SMS providers) require credentials or approvals outside this local project. The ZIP therefore implements free local/demo adapters and marks them explicitly rather than claiming that production connectivity was verified.
