-- Event-driven + webhook state-machine foundation

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS billing_last_event_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_last_event_id TEXT;

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  provider_event_type TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  status TEXT,
  payload JSONB NOT NULL,
  processing_state TEXT NOT NULL DEFAULT 'received',
  processing_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_webhook_events_provider_event_unique
  ON billing_webhook_events(provider, provider_event_id);

CREATE INDEX IF NOT EXISTS billing_webhook_events_customer_idx
  ON billing_webhook_events(customer_id);

CREATE TABLE IF NOT EXISTS event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS event_outbox_status_available_idx
  ON event_outbox(status, available_at, created_at);

COMMIT;
