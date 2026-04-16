-- Migrate billing columns from Stripe naming to Dodo naming.

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

-- Copy existing values when migrating from old Stripe-based schema.
UPDATE profiles
SET
  dodo_customer_id = COALESCE(dodo_customer_id, stripe_customer_id),
  dodo_subscription_id = COALESCE(dodo_subscription_id, stripe_subscription_id);

COMMIT;
