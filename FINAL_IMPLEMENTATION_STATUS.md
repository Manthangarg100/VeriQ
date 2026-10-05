# Veriq — Final Implementation & Validation Status

Date: 4 October 2026

## Implemented in the web application

The current build implements the non-external features developed from the supplied Legal Metrology report, project notes and research blueprint, including:

- local authentication, account approval, sessions, CSRF and role-based authorization
- Business, LMO, GATC and Admin workspaces
- instrument registration and permanent Instrument Passport
- verification / re-verification applications
- document/evidence uploads
- approval, rejection and resubmission
- fee/payment simulation without a paid gateway
- explainable risk scoring
- smart assignment recommendation
- LMO/GATC scheduling and GATC capacity accounting
- versioned demo metrology rule packages and rule simulation
- rule-driven inspection workflow and deterministic test calculation
- QR trust checks and serial-number identity matching
- persisted evidence files, SHA-256 hashing and evidence downloads
- browser image-quality assistance
- browser GPS capture
- PWA/offline browser workflow with AES-GCM encrypted browser drafts with IndexedDB-held encryption key and queued sync
- server-side inspection recalculation and PASS/FAIL override on failing checks
- Ed25519 trust signatures for certificates/inspection trust records
- certificate lifecycle/versioning/revocation
- signed public QR verification
- registered-location consistency checks
- public QR telemetry and anomaly detection
- multi-location and impossible-travel fraud signals
- explainable risk/fraud views and fraud resolution
- instrument relationship/fraud graph data
- public complaints with evidence and officer resolution
- owner feedback
- repair records and re-verification triggers
- relocation workflow and risk/fraud signal
- reinspection after failed verification
- 60/30/7-day and overdue expiry notifications
- GATC registration/edit/suspend/activate/capacity controls
- GATC standards and calibration state management
- GATC inspection isolation and standards gating
- admin user status/profile controls
- tamper-evident audit hash chain
- search, reports and CSV exports
- certificate print/save-to-PDF through the browser
- mail-client email sharing
- DigiLocker demo issuer adapter
- eSign/DSC demo adapter using local Ed25519 cryptography
- eMaap/state-system demo adapters
- MapLibre/OpenFreeMap map layer

## External integrations deliberately kept as adapters

The following cannot be truthfully activated without credentials/approval from the external authority/provider:

- production DigiLocker issuer integration
- production government eSign/DSC service
- production eMaap/state portal API credentials
- departmental SSO/OIDC identity provider
- production payment gateway
- government SMS/push/email delivery service

The ZIP does not claim those production connections are live. Their adapter points and demo flows are included.

## PostgreSQL

PostgreSQL support is included through `DATABASE_URL` and the provided `schema.sql`. Core collections are mirrored to relational PostgreSQL tables, with a compact local JSON cache retained so the hackathon ZIP remains runnable without an installed database.

A live PostgreSQL server was not available in the execution environment, so live database connectivity could not be exercised here. The schema, driver configuration and persistence code are included for local/hosted PostgreSQL setup.

## Validation

The sequential validation suite completed all 16 phases successfully, followed by static/frontend serving checks. A separate `backend/qa-preflight.js` check also validates protected-request failure behavior, health version, PWA shell, camera/GPS/offline capability hooks, and demo integration markers. The suites stop on failures.

Result:

```text
ALL API PHASES PASS
STATIC/FRONTEND SERVING PASS
QA PREFLIGHT PASS
```

Validated areas include authentication/RBAC/CSRF, instrument/application lifecycle, scheduling, inspection, evidence, certificate generation, public verification, anti-clone checks, complaints, feedback, repairs, relocation, fraud signals, admin controls, rules, GATC lifecycle/capacity, notifications, audit chain, reinspection, renewal, scan analytics, privacy, duplicate-evidence detection, expiry automation, jurisdiction enforcement, session expiry and attack-surface invariants.

## Run

Windows:

```text
start.bat
```

Validation:

```powershell
cd backend
npm test
```

The ZIP also includes `backend/qa-preflight.js` for HTTP/security/static capability checks.

Optional PostgreSQL mode:

```text
cd backend
npm install
set DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/veriq
node server.js
```

Demo accounts are documented in `README_QUICK_START.txt` and `README.md`.
