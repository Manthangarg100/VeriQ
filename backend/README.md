# Veriq Backend

Node.js REST API for the Veriq Legal Metrology workflow.

Run without PostgreSQL:

```text
node server.js
```

Run tests:

```text
node full-system-test.js
node static-test.js
```

Optional PostgreSQL:

```text
npm install
set DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/veriq
node server.js
```

The runtime keeps a compact JSON state cache for the portable hackathon build and mirrors the core entities into PostgreSQL when `DATABASE_URL` is available. See the root README for the architecture and production integration boundaries.
