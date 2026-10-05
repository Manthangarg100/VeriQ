-- Veriq PostgreSQL schema (free/local-ready)
-- The runtime currently uses a compact JSONB state store for portable local demos.
-- These tables provide production-oriented entities and indexes for a migration path.

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  organization text,
  jurisdiction text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_jurisdiction ON users(jurisdiction);

CREATE TABLE IF NOT EXISTS instruments (
  id text PRIMARY KEY,
  serial text UNIQUE NOT NULL,
  owner_id text,
  instrument_type text NOT NULL,
  status text,
  next_due date,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_instruments_owner ON instruments(owner_id);
CREATE INDEX IF NOT EXISTS idx_instruments_type ON instruments(instrument_type);
CREATE INDEX IF NOT EXISTS idx_instruments_due ON instruments(next_due);

CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  owner_id text,
  status text NOT NULL,
  request_type text NOT NULL,
  submitted_at timestamptz,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_applications_instrument ON applications(instrument_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS inspections (
  id text PRIMARY KEY,
  application_id text,
  instrument_id text NOT NULL,
  officer_id text,
  gatc_id text,
  status text,
  result text,
  evidence_hash text,
  started_at timestamptz,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inspections_instrument ON inspections(instrument_id);
CREATE INDEX IF NOT EXISTS idx_inspections_officer ON inspections(officer_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);

CREATE TABLE IF NOT EXISTS certificates (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  version integer NOT NULL,
  status text NOT NULL,
  valid_from date,
  valid_to date,
  signature text NOT NULL,
  evidence_hash text,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_certificates_instrument ON certificates(instrument_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_valid_to ON certificates(valid_to);

CREATE TABLE IF NOT EXISTS complaints (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  status text NOT NULL,
  category text NOT NULL,
  submitted_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_complaints_instrument ON complaints(instrument_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

CREATE TABLE IF NOT EXISTS repairs (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  repair_date date,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_repairs_instrument ON repairs(instrument_id);

CREATE TABLE IF NOT EXISTS fraud_signals (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fraud_instrument ON fraud_signals(instrument_id);
CREATE INDEX IF NOT EXISTS idx_fraud_open ON fraud_signals(resolved);

CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY,
  entity_type text,
  entity_id text,
  actor_id text,
  action text NOT NULL,
  previous_hash text,
  hash text NOT NULL,
  timestamp timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type,entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);

CREATE TABLE IF NOT EXISTS scan_events (
  id text PRIMARY KEY,
  certificate_id text,
  instrument_id text,
  status text,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scan_certificate ON scan_events(certificate_id);
CREATE INDEX IF NOT EXISTS idx_scan_created ON scan_events(created_at);

CREATE TABLE IF NOT EXISTS evidence_files (
  id text PRIMARY KEY,
  inspection_id text,
  instrument_id text,
  hash text NOT NULL,
  name text,
  path text,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON evidence_files(hash);
CREATE INDEX IF NOT EXISTS idx_evidence_inspection ON evidence_files(inspection_id);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  type text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id,read);

CREATE TABLE IF NOT EXISTS veriq_state (
  id integer PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id text PRIMARY KEY,
  instrument_id text NOT NULL,
  owner_id text NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_instrument ON feedback(instrument_id);

CREATE TABLE IF NOT EXISTS gatc_centres (
  id text PRIMARY KEY,
  name text NOT NULL,
  city text,
  state text,
  status text,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS metrology_standards (
  id text PRIMARY KEY,
  gatc_id text NOT NULL,
  name text NOT NULL,
  calibration_due date,
  status text,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS integration_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  entity_id text,
  status text,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
