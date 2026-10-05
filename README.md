# Veriq — SIH26036 Full Functional Build

Veriq is a free/open-source-first Legal Metrology workflow prototype built on the existing Veriq UI. The frontend visual system is intentionally preserved; new workflow screens and actions reuse the same cards, drawers, tables, badges, buttons and typography.

## What is implemented

### Core lifecycle
- Stakeholder login/signup with role-aware workspaces
- Instrument registration and permanent Instrument Passport
- Verification / re-verification applications
- Local fee/payment simulation (no paid payment gateway)
- Explainable risk scoring
- Smart officer / GATC assignment recommendation
- Inspection scheduling
- Rule-driven inspection checklist
- Test readings + deterministic error calculation
- Evidence capture metadata + SHA-256 file hashing in the browser
- GPS capture using the browser Geolocation API
- Offline inspection draft queue in browser local storage
- Manual sync of offline inspection drafts
- Inspection signing + evidence hash
- Digital certificate issuance
- Certificate version/signature metadata
- Certificate revocation
- Public QR/certificate verification
- Physical serial-number mismatch detection to demonstrate QR cloning defence
- Public complaint submission from QR verification
- Officer complaint resolution
- Fraud/anomaly signals and resolution
- Immutable-style audit chain using previousHash + current hash
- Audit detail per record
- GATC directory + reference-standard traceability view
- Reports / risk export to CSV
- Certificate print / Save-as-PDF through the browser
- Email sharing through the system mail client (`mailto:`)
- Demo DigiLocker issuer adapter (no paid service / no credentials required)
- Open-source map rendering with MapLibre + OpenFreeMap

### Product concepts from the research
- Instrument identity
- Metrology rule package / rules-as-code foundation
- Evidence capsule
- Signed certificate / trust chain
- Explainable risk score
- Risk command centre
- Public trust verification
- Fraud signals
- Audit lineage
- GATC standards traceability

## Technology stack

### Frontend
- Vanilla JavaScript + the supplied HTML/CSS visual system
- Existing styles preserved
- MapLibre GL (open source) + OpenFreeMap style/tiles
- qrcode-generator (open-source browser library loaded from a public CDN)
- Browser Geolocation API
- Web Crypto API for SHA-256 evidence hashing

### Backend
- Node.js built-in `http`, `crypto`, `fs` modules
- REST JSON API
- HTTP-only session cookies
- `crypto.scrypt` password hashing
- HMAC-SHA256 demo certificate signatures
- Optional PostgreSQL support via `pg`

### Database
The architecture is **PostgreSQL-ready and supports PostgreSQL through `DATABASE_URL`**. The local zip remains runnable without installing a database by falling back to a local JSON store. When the `pg` package is installed and `DATABASE_URL` is present, the server initializes a PostgreSQL `veriq_state` JSONB store and persists the application state there.

For the hackathon, this avoids forcing the team to install a database just to run the demo. For deployment, use a free PostgreSQL service or an approved PostgreSQL host and set `DATABASE_URL`.

## Run locally

### Fastest path — no external database required

1. Install Node.js 18+.
2. Double-click `start.bat`.
3. Open `http://127.0.0.1:4170/`.
4. Keep the server terminal open.
5. Use one of the seeded accounts below.

### Seeded accounts

Password for all: `Measure@123`

- Business: `business@veriq.local`
- LMO: `lmo@veriq.local`
- GATC: `gatc@veriq.local`
- Admin: `admin@veriq.local`

### PostgreSQL mode

1. Install Node.js 18+.
2. In `backend`, run `npm install`.
3. Create a PostgreSQL database.
4. Set `DATABASE_URL` in your environment.
5. Optionally set `VERIQ_SIGNING_SECRET` to a long random value.
6. Start the server with `node backend/server.js` or `start.bat`.

Example:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
DATABASE_SSL=true
VERIQ_SIGNING_SECRET=change-me
```

The server creates `veriq_state` automatically. `backend/schema.sql` is also included.

## Important demo / production boundaries

- The payment flow is deliberately a local simulation because the requirement was to avoid paid APIs.
- The DigiLocker screen is a **demo issuer adapter**. Real DigiLocker issuer onboarding and credentials are external government integration requirements.
- Certificate signatures use an HMAC demo secret. Production deployment should use an approved signing/eSign/DSC integration.
- The offline mode is a browser demonstration using local storage. A production Android officer app should use encrypted SQLite + secure device storage as described in the research architecture.
- The rules engine included here is a deterministic prototype; legal rule values and instrument-specific procedures must be configured/validated by the department before real regulatory use.
- Risk scoring is an explainable prioritisation aid, not a legal decision-maker.
- Public QR verification deliberately exposes only public trust information; internal risk, officer notes and sensitive audit data stay behind role-based access.

## Main API endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Instruments
- `GET /api/instruments`
- `POST /api/instruments`
- `GET /api/instruments/:id`

### Applications
- `GET /api/applications`
- `POST /api/applications`
- `POST /api/applications/:id/approve`
- `POST /api/applications/:id/schedule`
- `GET /api/scheduling/recommend?applicationId=...`

### Inspections
- `GET /api/inspections`
- `GET /api/inspections/:id`
- `POST /api/inspections`
- `POST /api/inspections/:id/submit`
- `POST /api/inspections/:id/sign`

### Certificates / trust
- `GET /api/certificates`
- `GET /api/certificates/:id`
- `POST /api/certificates/:id/revoke`
- `POST /api/certificates/:id/digilocker`
- `GET /api/certificates/:id/print`
- `GET /api/public/verify/:certificateId`

### Risk / fraud / complaints
- `GET /api/risk`
- `GET /api/fraud-signals`
- `POST /api/fraud-signals/:id/resolve`
- `GET /api/complaints`
- `POST /api/public/complaints`
- `POST /api/complaints/:id/resolve`

### Operations
- `GET /api/gatc`
- `GET /api/rules`
- `GET /api/reports`
- `GET /api/audit`
- `GET /api/audit/:entityId`
- `GET /api/search?q=...`
- `GET /api/export/instruments`
- `GET /api/health`

## Recommended demo sequence

1. Login as Business.
2. Open Instruments → register a new instrument.
3. Create a Verification application.
4. Switch to LMO → approve / schedule.
5. Open Inspections → start field workspace.
6. Capture GPS, upload evidence and enter test readings.
7. Submit PASS → certificate is generated automatically.
8. Open Certificates → show signed record and QR.
9. Scan / use public Verify → show VERIFIED.
10. Repeat verification with a wrong serial → show MISMATCH.
11. Submit a public complaint.
12. Open Risk Command → show the instrument/risk queue and fraud signals.
13. Open Audit Trail → show the full event chain.
14. Open Reports → export risk data.

## Research basis reflected in the build

The supplied project report defines the required end-to-end flow as registration → application → scheduling → field verification → QR digital certificate → expiry tracking → re-verification; role-based dashboards; offline field capture; digital observations; signed QR; audit trail; search/export; and integration-ready architecture. The build above implements those flows in the existing UI style and adds the risk, fraud, trust-chain and complaint capabilities developed in the accompanying research.
