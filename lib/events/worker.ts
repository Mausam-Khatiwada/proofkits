import { createServiceClient } from '@/lib/supabase/server';

type OutboxEventRow = {
  id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'processed' | 'dead_letter';
  attempts: number;
  available_at: string;
  created_at: string;
};

function retryDelaySeconds(attempt: number): number {
  const cappedAttempt = Math.min(attempt, 8);
  return Math.min(300, 2 ** cappedAttempt);
}

async function handleOutboxEvent(event: OutboxEventRow): Promise<void> {
  // Placeholder consumer: emit structured event to logs.
  // Later this can fan out to queues/webhooks/analytics providers.
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      type: 'outbox_dispatch',
      eventType: event.event_type,
      aggregateType: event.aggregate_type,
      aggregateId: event.aggregate_id,
      actorUserId: event.actor_user_id,
      payload: event.payload,
    })
  );
}

export async function processOutboxBatch({
  batchSize = 25,
  maxAttempts = 8,
}: {
  batchSize?: number;
  maxAttempts?: number;
}) {
  const supabase = await createServiceClient();

  const { data: candidates, error: selectError } = await supabase
    .from('event_outbox')
    .select('id, event_type, aggregate_type, aggregate_id, actor_user_id, payload, status, attempts, available_at, created_at')
    .eq('status', 'pending')
    .lte('available_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (selectError) {
    const message = selectError.message.toLowerCase();
    if (message.includes('does not exist') || message.includes('relation') || message.includes('undefined table')) {
      return { processed: 0, failed: 0, deadLettered: 0, skipped: 0, note: 'outbox_table_missing' as const };
    }
    throw new Error(`Outbox select failed: ${selectError.message}`);
  }

  const events = (candidates ?? []) as OutboxEventRow[];
  let processed = 0;
  let failed = 0;
  let deadLettered = 0;
  let skipped = 0;

  for (const event of events) {
    const { data: claimedRow, error: claimError } = await supabase
      .from('event_outbox')
      .update({ status: 'processing' })
      .eq('id', event.id)
      .eq('status', 'pending')
      .select('id')
      .single();

    if (claimError || !claimedRow) {
      skipped += 1;
      continue;
    }

    try {
      await handleOutboxEvent(event);
      processed += 1;

      await supabase
        .from('event_outbox')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id);
    } catch (error) {
      failed += 1;
      const nextAttempts = event.attempts + 1;
      const deadLetter = nextAttempts >= maxAttempts;
      const nextAvailableAt = new Date(Date.now() + retryDelaySeconds(nextAttempts) * 1000).toISOString();
      const message = error instanceof Error ? error.message : 'unknown_error';

      await supabase
        .from('event_outbox')
        .update({
          status: deadLetter ? 'dead_letter' : 'pending',
          attempts: nextAttempts,
          available_at: deadLetter ? new Date().toISOString() : nextAvailableAt,
          processed_at: deadLetter ? new Date().toISOString() : null,
          last_error: message.slice(0, 600),
        })
        .eq('id', event.id);

      if (deadLetter) {
        deadLettered += 1;
      }
    }
  }

  return { processed, failed, deadLettered, skipped };
}

