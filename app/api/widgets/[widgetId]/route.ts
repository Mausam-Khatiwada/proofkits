import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { z } from 'zod';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { emitDomainEvent } from '@/lib/events/outbox';
import { requireWidgetOwner } from '@/lib/security/permissions';
import { resolveBillingContextForUser } from '@/lib/billing/profile';
import { canAccessPricingFeature } from '@/lib/billing/plans';

const updateWidgetSchema = z.object({
  show_badge: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { widgetId } = await params;

  if (!isValidUuid(widgetId)) {
    return NextResponse.json({ error: 'Invalid widget ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logSecurityEvent({ action: 'widget.update', outcome: 'denied', detail: 'unauthorized', targetId: widgetId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_widget_update',
    limit: 60,
    windowMs: 60_000,
    keyExtras: [user.id, widgetId],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'widget.update', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: widgetId, request });
    return rateLimitResponse;
  }

  const widget = await requireWidgetOwner({
    supabase,
    userId: user.id,
    widgetId,
    select: 'id, user_id, show_badge',
  });

  if (!widget) {
    logSecurityEvent({ action: 'widget.update', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: widgetId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateWidgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid widget update' },
      { status: 400 }
    );
  }

  const { plan } = await resolveBillingContextForUser({ supabase, user, syncPlan: true });
  if (!parsed.data.show_badge && !canAccessPricingFeature(plan, 'remove_badge')) {
    logSecurityEvent({ action: 'widget.update', outcome: 'denied', userId: user.id, detail: 'badge_removal_locked', targetId: widgetId, request });
    return NextResponse.json(
      { error: 'Removing the Proofengine badge is available on Pro only.' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('widgets')
    .update({ show_badge: parsed.data.show_badge })
    .eq('id', widgetId);

  if (error) {
    logSecurityEvent({ action: 'widget.update', outcome: 'error', userId: user.id, detail: error.message, targetId: widgetId, request });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logSecurityEvent({ action: 'widget.update', outcome: 'success', userId: user.id, targetId: widgetId, request });
  await emitDomainEvent({
    eventType: 'widget.updated',
    aggregateType: 'widget',
    aggregateId: widgetId,
    actorUserId: user.id,
    payload: {
      widgetId,
      userId: user.id,
      show_badge: parsed.data.show_badge,
    },
  });

  return NextResponse.json({ show_badge: parsed.data.show_badge });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { widgetId } = await params;

  if (!isValidUuid(widgetId)) {
    return NextResponse.json({ error: 'Invalid widget ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logSecurityEvent({ action: 'widget.delete', outcome: 'denied', detail: 'unauthorized', targetId: widgetId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_widget_delete',
    limit: 30,
    windowMs: 60_000,
    keyExtras: [user.id],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'widget.delete', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: widgetId, request });
    return rateLimitResponse;
  }

  const { data: widget } = await supabase
    .from('widgets')
    .select('user_id')
    .eq('id', widgetId)
    .single();

  if (!widget || widget.user_id !== user.id) {
    logSecurityEvent({ action: 'widget.delete', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: widgetId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('widgets')
    .delete()
    .eq('id', widgetId);

  if (error) {
    logSecurityEvent({ action: 'widget.delete', outcome: 'error', userId: user.id, detail: error.message, targetId: widgetId, request });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logSecurityEvent({ action: 'widget.delete', outcome: 'success', userId: user.id, targetId: widgetId, request });
  await emitDomainEvent({
    eventType: 'widget.deleted',
    aggregateType: 'widget',
    aggregateId: widgetId,
    actorUserId: user.id,
    payload: { widgetId, userId: user.id },
  });
  return NextResponse.json({ success: true });
}
