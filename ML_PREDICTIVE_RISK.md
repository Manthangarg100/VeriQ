# Veriq Predictive Trust Engine

Veriq now includes a prototype machine-learning layer on top of the existing deterministic risk engine.

## What was added
- Explainable logistic-regression model trained from the local Veriq lifecycle schema.
- Features: failed inspections, complaints, repairs, violations, days to expiry, verification scans, open fraud signals, instrument age and location anomalies.
- Hybrid risk score: 55% existing deterministic lifecycle score + 45% ML probability score.
- Model metadata endpoint: `/api/risk/model`.
- Authorized ML signal recomputation: `POST /api/risk/recompute` (LMO/Admin).
- New `ML_PREDICTIVE_RISK` fraud/trust signal when the model probability reaches the configured advisory threshold.
- Risk Command UI now exposes model version, ML probability, feature contributions and human-review boundary.

## Training
The training script is intentionally dependency-free so the hackathon prototype is easy to reproduce. It reads the local lifecycle JSON and creates deterministic bootstrap variations around the actual project data. This is **prototype training**, not a claim of production accuracy.

From `backend/`:

```text
npm run train:risk
```

The generated model is stored at `backend/data/risk-model.json`.

## Important boundary
The ML output is advisory intelligence. It does not automatically approve, reject, revoke or enforce against an instrument. Authorized officers remain responsible for inspection and regulatory decisions. The model is not department-validated and should not be presented as an official Legal Metrology decision engine.

## Advanced-feature story for the PPT
**Predictive Trust Intelligence — from reactive verification to proactive inspection prioritization.**

Historical lifecycle evidence → ML risk prediction → explainable factors → anomaly/trust signal → prioritized human inspection.
