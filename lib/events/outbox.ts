import { createServiceClient } from '@/lib/supabase/server';

export async function emitDomainEvent(event: {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  actorUserId?: string;
  payload: Record<string, unknown>;
}) {
  try {
    const supabase = await createServiceClient();
    await supabase.from('event_outbox').insert({
      event_type: event.eventType,
      aggregate_type: event.aggregateType,
      aggregate_id: event.aggregateId,
      actor_user_id: event.actorUserId ?? null,
      payload: event.payload,
      status: 'pending',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.warn(`event_outbox_emit_failed:${event.eventType}:${message}`);
  }
}

