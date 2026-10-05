# Veriq — Implementation Update

## Version 4.0 — Predictive Trust Intelligence

This build extends the existing SIH26036 Veriq workflow without replacing the implemented certificate, QR, inspection, PWA, fraud, audit or GATC modules.

### Newly implemented
1. **Predictive Trust Engine**
   - Explainable logistic-regression ML model.
   - Model artifact: `backend/data/risk-model.json`.
   - Training script: `ml/train_model.py`.
   - Lifecycle features include failures, complaints, repairs, violations, expiry timing, scan activity, open fraud, instrument age and location anomalies.

2. **Hybrid Risk Scoring**
   - Existing deterministic risk remains active.
   - Hybrid score combines deterministic lifecycle risk with ML probability.
   - ML output is advisory and cannot automatically approve/reject/revoke an instrument.

3. **ML Risk API**
   - `GET /api/risk/model`
   - `POST /api/risk/recompute` for LMO/Admin
   - Existing `GET /api/risk` now returns ML probability, model version and model contribution details.

4. **ML Fraud/Trust Signals**
   - `ML_PREDICTIVE_RISK` signals can be generated when configured model probability crosses the advisory threshold.
   - Signals remain subject to authorized human review.

5. **Risk Command UI**
   - Model version and training rows.
   - ML probability per instrument.
   - Feature contribution visibility.
   - Recompute ML signals action.
   - Explicit human-review boundary.

6. **Test coverage**
   - Added `backend/ml-test.js`.
   - `npm test` now validates the ML model, all existing 16 API phases and static/frontend checks.

## Existing advanced capabilities retained
- Instrument Passport and lifecycle history.
- Explainable deterministic risk.
- Smart scheduling and GATC capacity.
- Inspection readings and server-side recalculation.
- Evidence hashing and metadata.
- Offline PWA encrypted drafts and queued sync.
- Ed25519 demo trust signing.
- QR public verification and anti-clone serial checks.
- Complaints, feedback, repairs and reinspection.
- Fraud graph and scan analytics.
- Tamper-evident audit chain.
- Reports/export and MapLibre/OpenFreeMap map support.
- Demo adapters for DigiLocker/eSign/eMaap/state integrations.

## Deliberate production boundaries
- Government integrations remain adapters without production credentials.
- Demo metrology parameters require department validation.
- The ML model is a hackathon prototype, not an official regulatory decision engine.
- Human review remains mandatory for enforcement decisions.
- Native Flutter/Android field app, live PostGIS route optimization, authoritative regulatory rule governance and production security assurance remain future deployment work.
