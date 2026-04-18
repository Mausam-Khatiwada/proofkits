import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { sanitizePlainText } from '@/lib/security/input-sanitize';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { emitDomainEvent } from '@/lib/events/outbox';
import { resolveBillingContextForUser } from '@/lib/billing/profile';
import { getWidgetLimit } from '@/lib/billing/plans';

const createWidgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logSecurityEvent({ action: 'widget.create', outcome: 'denied', detail: 'unauthorized', request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_widget_create',
    limit: 20,
    windowMs: 60_000,
    keyExtras: [user.id],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'widget.create', outcome: 'denied', userId: user.id, detail: 'rate_limited', request });
    return rateLimitResponse;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createWidgetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { plan: effectivePlan } = await resolveBillingContextForUser({ supabase, user, syncPlan: true });

  const { count } = await supabase
    .from('widgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const widgetLimit = getWidgetLimit(effectivePlan);
  if (widgetLimit !== null && (count ?? 0) >= widgetLimit) {
    logSecurityEvent({ action: 'widget.create', outcome: 'denied', userId: user.id, detail: 'free_plan_limit', request });
    return NextResponse.json(
      { error: 'Starter plan is limited to 1 widget. Upgrade to Pro for unlimited widgets.' },
      { status: 403 }
    );
  }

  const sanitizedName = sanitizePlainText(parsed.data.name, 100);
  const slug = slugify(sanitizedName);

  const { data: widget, error } = await supabase
    .from('widgets')
    .insert({
      user_id: user.id,
      name: sanitizedName,
      slug,
      show_badge: effectivePlan === 'free',
    })
    .select()
    .single();

  if (error) {
    logSecurityEvent({ action: 'widget.create', outcome: 'error', userId: user.id, detail: error.message, request });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logSecurityEvent({ action: 'widget.create', outcome: 'success', userId: user.id, targetId: widget.id, request });
  await emitDomainEvent({
    eventType: 'widget.created',
    aggregateType: 'widget',
    aggregateId: widget.id,
    actorUserId: user.id,
    payload: { widgetId: widget.id, userId: user.id, plan: effectivePlan },
  });
  return NextResponse.json(widget, { status: 201 });
}
