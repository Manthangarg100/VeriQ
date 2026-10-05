Veriq - Quick Start
==========================

1. Extract the ZIP completely.
2. Make sure Node.js 18+ is installed.
3. Double-click start.bat.
4. A backend terminal opens and the browser opens automatically at:
   http://127.0.0.1:4170/
5. Keep the backend terminal open while using the app.
6. To stop the server, close the backend terminal or run stop.bat.

The prototype backend runs without PostgreSQL. PostgreSQL is optional.


Predictive Trust Engine
-----------------------
Train/retrain the prototype risk model from the local lifecycle JSON (or a clean-extract bootstrap dataset):

```powershell
cd backend
npm install
npm run train:risk
npm test
```

For a clean extract, `npm run train:risk` now works before the server has been started. Once the application has created `backend/data/veriq.json`, subsequent training uses that real local lifecycle dataset.


Deep QA
--------
Run the automated QA preflight before a demo:

```powershell
cd backend
npm run qa
npm test
```

The preflight checks authentication failure responses, health/version consistency, static/PWA files, camera QR hooks, GPS capture, encrypted offline-draft hooks, responsive viewport metadata, and the explicit demo status of external adapters. Real PostgreSQL connectivity and browser permission/device behavior still require a local browser/database environment.
