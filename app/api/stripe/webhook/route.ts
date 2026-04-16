import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { verifyDodoWebhook } from '@/lib/dodo';
import { applyBillingStateTransition } from '@/lib/billing/webhook-state-machine';
import { logOpsEvent } from '@/lib/monitoring/ops';
import { emitDomainEvent } from '@/lib/events/outbox';
import { processOutboxBatch } from '@/lib/events/worker';

function getString(record: Record<string, unknown> | undefined, key: string): string | null {
  const value = record?.[key];
  return typeof value === 'string' ? value : null;
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await enforceRateLimit({
      request,
      scope: 'public_dodo_webhook',
      limit: 240,
      windowMs: 60_000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.text();
    const headersList = await headers();
    const webhookId = headersList.get('webhook-id');
    const webhookTimestamp = headersList.get('webhook-timestamp');
    const webhookSignature = headersList.get('webhook-signature');

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      logOpsEvent({
        request,
        category: 'billing_webhook',
        action: 'dodo_webhook_receive',
        outcome: 'denied',
        detail: 'missing_signature_headers',
      });
      return NextResponse.json({ error: 'Unauthorized: missing webhook signature headers' }, { status: 401 });
    }

    let event;
    try {
      event = verifyDodoWebhook({
        rawBody: body,
        webhookId,
        webhookTimestamp,
        webhookSignature,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logOpsEvent({
        request,
        category: 'billing_webhook',
        action: 'dodo_webhook_verify',
        outcome: 'denied',
        detail: message,
      });
      return NextResponse.json({ error: `Unauthorized: invalid signature (${message})` }, { status: 401 });
    }

    const supabase = await createServiceClient();
    const eventType = event.type;
    const data = event.data;
    const customer = (data?.customer as Record<string, unknown> | undefined) ?? undefined;
    const metadata = (data?.metadata as Record<string, unknown> | undefined) ?? undefined;

    const customerId = getString(customer, 'customer_id') ?? getString(data, 'customer_id');
    const subscriptionId = getString(data, 'subscription_id');
    const status = getString(data, 'status');
    const supabaseUserId = getString(metadata, 'supabase_user_id');
    const eventAt = new Date(Number(webhookTimestamp) * 1000);

    // Idempotency fence: process each provider event only once.
    try {
      const { error: insertEventError } = await supabase
        .from('billing_webhook_events')
        .insert({
          provider: 'dodo',
          provider_event_id: webhookId,
          provider_event_type: eventType,
          customer_id: customerId,
          subscription_id: subscriptionId,
          status,
          payload: event,
          processing_state: 'received',
        });

      if (insertEventError && insertEventError.message?.toLowerCase().includes('duplicate')) {
        logOpsEvent({
          request,
          category: 'billing_webhook',
          action: 'dodo_webhook_dedupe',
          outcome: 'skipped',
          detail: 'duplicate_event_id',
          targetId: webhookId,
        });
        return NextResponse.json({ received: true, duplicate: true });
      }
    } catch {
      // Allow webhook processing to continue even if tracking table isn't migrated yet.
    }

    if (!customerId) {
      logOpsEvent({
        request,
        category: 'billing_webhook',
        action: 'dodo_webhook_parse',
        outcome: 'skipped',
        detail: 'missing_customer_id',
        targetId: webhookId,
      });
      return NextResponse.json({ received: true });
    }

    type ProfileForState = {
      id: string;
      plan: string | null;
      dodo_subscription_id: string | null;
      billing_last_event_at: string | null;
    };
    let profileForState: ProfileForState | null = null;

    if (supabaseUserId) {
      const { data } = await supabase
        .from('profiles')
        .select('id, plan, dodo_subscription_id, billing_last_event_at')
        .eq('id', supabaseUserId)
        .single();
      profileForState = (data as ProfileForState | null) ?? null;
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('id, plan, dodo_subscription_id, billing_last_event_at')
        .eq('dodo_customer_id', customerId)
        .single();
      profileForState = (data as ProfileForState | null) ?? null;
    }

    const transition = applyBillingStateTransition({
      current: {
        plan: profileForState?.plan === 'pro' ? 'pro' : 'free',
        subscriptionId: profileForState?.dodo_subscription_id ?? null,
        lastEventAt: profileForState?.billing_last_event_at
          ? new Date(profileForState.billing_last_event_at)
          : null,
      },
      event: {
        providerEventId: webhookId,
        providerEventType: eventType,
        eventAt,
        status,
        customerId,
        subscriptionId,
      },
    });

    if (!transition.shouldPersist) {
      logOpsEvent({
        request,
        category: 'billing_webhook',
        action: 'dodo_webhook_transition',
        outcome: 'skipped',
        detail: transition.reason,
        targetId: webhookId,
      });
      return NextResponse.json({ received: true, stale: true });
    }

    const updatePayload = {
      plan: transition.next.plan,
      dodo_customer_id: customerId,
      dodo_subscription_id: transition.next.subscriptionId,
      billing_last_event_at: transition.next.lastEventAt?.toISOString() ?? null,
      billing_last_event_id: webhookId,
    };

    if (supabaseUserId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', supabaseUserId);
      if (updateError) {
        await supabase
          .from('profiles')
          .update({
            plan: transition.next.plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: transition.next.subscriptionId,
          })
          .eq('id', supabaseUserId);
      }
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('dodo_customer_id', customerId);
      if (updateError) {
        await supabase
          .from('profiles')
          .update({
            plan: transition.next.plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: transition.next.subscriptionId,
          })
          .eq('stripe_customer_id', customerId);
      }
    }

    try {
      await supabase
        .from('billing_webhook_events')
        .update({
          processing_state: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('provider', 'dodo')
        .eq('provider_event_id', webhookId);
    } catch {
      // Best-effort update for observability table.
    }

    await emitDomainEvent({
      eventType: 'billing.subscription_state.changed',
      aggregateType: 'profile',
      aggregateId: supabaseUserId ?? customerId,
      actorUserId: supabaseUserId ?? undefined,
      payload: {
        provider: 'dodo',
        providerEventId: webhookId,
        providerEventType: eventType,
        customerId,
        subscriptionId: transition.next.subscriptionId,
        plan: transition.next.plan,
        reason: transition.reason,
      },
    });

    logOpsEvent({
      request,
      category: 'billing_webhook',
      action: 'dodo_webhook_process',
      outcome: 'success',
      userId: supabaseUserId ?? undefined,
      targetId: webhookId,
      detail: transition.reason,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logOpsEvent({
      request,
      category: 'billing_webhook',
      action: 'dodo_webhook_process',
      outcome: 'error',
      detail: message,
    });
    return NextResponse.json({ error: `Webhook processing failed: ${message}` }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const workerKey = process.env.OUTBOX_WORKER_KEY;
  const allowVercelCron = process.env.OUTBOX_ALLOW_VERCEL_CRON === 'true';
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (!workerKey && !(allowVercelCron && vercelCronHeader)) {
    return NextResponse.json({ error: 'OUTBOX_WORKER_KEY is not configured' }, { status: 500 });
  }

  const headerKey = request.headers.get('x-outbox-worker-key');
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('key');
  const providedKey = headerKey ?? bearer ?? queryKey;

  const hasValidKey = Boolean(workerKey && providedKey && providedKey === workerKey);
  const hasTrustedCron = Boolean(allowVercelCron && vercelCronHeader);

  if (!hasValidKey && !hasTrustedCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchSizeRaw = url.searchParams.get('batch');
  const batchSize = Number.isFinite(Number(batchSizeRaw)) ? Math.max(1, Math.min(100, Number(batchSizeRaw))) : 25;
  const result = await processOutboxBatch({ batchSize });

  logOpsEvent({
    request,
    category: 'outbox_worker',
    action: 'outbox_batch_process',
    outcome: 'success',
    detail: 'worker_batch_complete',
    extra: result,
  });

  return NextResponse.json({ ok: true, ...result });
}
