# ProofEngine - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Dodo Payments account
- A Resend account
- A Vercel account (optional for deployment)

## 1. Install

```bash
cd proofengine
npm install
```

## 2. Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL editor.
3. If this is an existing DB, also run migrations:
   - `supabase/migrations/20260415_security_hardening.sql`
   - `supabase/migrations/20260415_text_sanitization.sql`
   - `supabase/migrations/20260415_dodo_billing_migration.sql`
   - `supabase/migrations/20260415_event_driven_security_foundation.sql`
   - `supabase/migrations/20260415_outbox_worker_columns.sql`
4. Add auth redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 3. Dodo Payments Setup

1. In Dodo dashboard, create your Pro recurring product.
2. Copy product ID to `DODO_PRODUCT_ID_PRO`.
3. Create API key and webhook key.
4. Configure webhook endpoint:
   - Local: `http://localhost:3000/api/stripe/webhook`
   - Production: `https://your-domain.com/api/stripe/webhook`

Note: The route path is `/api/stripe/webhook` for backward compatibility, but it is fully Dodo-backed.

## 4. Resend Setup

1. Create a Resend API key.
2. Set `RESEND_API_KEY`.

## 5. Environment Variables

Use this `.env.local` template:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

DODO_PAYMENTS_API_KEY=dp_test_...
DODO_PAYMENTS_WEBHOOK_KEY=whsec_...
DODO_PRODUCT_ID_PRO=prod_...
DODO_PAYMENTS_ENVIRONMENT=test
# optional
# DODO_PAYMENTS_BASE_URL=https://test.dodopayments.com

RESEND_API_KEY=re_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# optional security controls
AUDIT_LOG_SALT=your-random-secret
CSP_REPORT_ONLY=true
CSP_REPORT_URI=https://your-csp-report-collector.example.com
AUDIT_LOG_SALT=your-random-secret
OUTBOX_WORKER_KEY=your-random-long-secret
OUTBOX_ALLOW_VERCEL_CRON=false
```

## 6. Run Locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## 7. Deploy

1. Deploy to Vercel.
2. Add all env vars in Vercel project settings.
3. Set production webhook URL in Dodo dashboard to `/api/stripe/webhook`.
4. Confirm one real webhook event updates `profiles.plan` correctly.
5. Set up outbox worker scheduler:
   - Trigger: `GET /api/stripe/webhook?batch=25`
   - Auth: `x-outbox-worker-key: <OUTBOX_WORKER_KEY>` header (recommended)
   - Optional Vercel Cron mode: set `OUTBOX_ALLOW_VERCEL_CRON=true`
