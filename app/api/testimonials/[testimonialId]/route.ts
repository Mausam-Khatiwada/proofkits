import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { z } from 'zod';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { requireAuthenticatedUser, requireTestimonialOwner } from '@/lib/security/permissions';
import { emitDomainEvent } from '@/lib/events/outbox';
import { canAccessPricingFeature } from '@/lib/billing/plans';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

const testimonialPatchSchema = z
  .object({
    body: z.string().min(1, 'Body is required').max(2000).optional(),
    author_name: z.string().min(1).max(100).optional(),
    author_role: z.union([z.string().max(100), z.null()]).optional(),
    author_company: z.union([z.string().max(100), z.null()]).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { testimonialId } = await params;

  if (!isValidUuid(testimonialId)) {
    return NextResponse.json({ error: 'Invalid testimonial ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await requireAuthenticatedUser(supabase);

  if (!user) {
    logSecurityEvent({ action: 'testimonial.patch', outcome: 'denied', detail: 'unauthorized', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_testimonial_patch',
    limit: 120,
    windowMs: 60_000,
    keyExtras: [user.id],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'testimonial.patch', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: testimonialId, request });
    return rateLimitResponse;
  }

  const testimonial = await requireTestimonialOwner({
    supabase,
    userId: user.id,
    testimonialId,
    select: 'id, widget_id',
  });

  if (!testimonial) {
    logSecurityEvent({ action: 'testimonial.patch', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { plan } = await resolveBillingContextForUser({
    supabase,
    user: user as User,
    syncPlan: true,
  });
  if (!canAccessPricingFeature(plan, 'testimonial_editor')) {
    logSecurityEvent({ action: 'testimonial.patch', outcome: 'denied', userId: user.id, detail: 'plan_testimonial_editor', targetId: testimonialId, request });
    return NextResponse.json(
      { error: 'Testimonial editing is available on Pro. Upgrade to edit copy and author details.' },
      { status: 403 }
    );
  }

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = testimonialPatchSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 400 }
    );
  }

  const updates: Record<string, string | null> = {};
  if (parsed.data.body !== undefined) updates.body = parsed.data.body;
  if (parsed.data.author_name !== undefined) updates.author_name = parsed.data.author_name;
  if (parsed.data.author_role !== undefined) updates.author_role = parsed.data.author_role;
  if (parsed.data.author_company !== undefined) updates.author_company = parsed.data.author_company;

  const { data: updated, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', testimonialId)
    .select('*')
    .single();

  if (error) {
    logSecurityEvent({ action: 'testimonial.patch', outcome: 'error', userId: user.id, detail: error.message, targetId: testimonialId, request });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logSecurityEvent({ action: 'testimonial.patch', outcome: 'success', userId: user.id, targetId: testimonialId, request });
  await emitDomainEvent({
    eventType: 'testimonial.updated',
    aggregateType: 'testimonial',
    aggregateId: testimonialId,
    actorUserId: user.id,
    payload: { testimonialId, userId: user.id, fields: Object.keys(updates) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { testimonialId } = await params;

  if (!isValidUuid(testimonialId)) {
    return NextResponse.json({ error: 'Invalid testimonial ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await requireAuthenticatedUser(supabase);

  if (!user) {
    logSecurityEvent({ action: 'testimonial.delete', outcome: 'denied', detail: 'unauthorized', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_testimonial_delete',
    limit: 60,
    windowMs: 60_000,
    keyExtras: [user.id],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'testimonial.delete', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: testimonialId, request });
    return rateLimitResponse;
  }

  const testimonial = await requireTestimonialOwner({
    supabase,
    userId: user.id,
    testimonialId,
    select: 'id, widget_id',
  });

  if (!testimonial) {
    logSecurityEvent({ action: 'testimonial.delete', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', testimonialId);

  if (error) {
    logSecurityEvent({ action: 'testimonial.delete', outcome: 'error', userId: user.id, detail: error.message, targetId: testimonialId, request });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logSecurityEvent({ action: 'testimonial.delete', outcome: 'success', userId: user.id, targetId: testimonialId, request });
  await emitDomainEvent({
    eventType: 'testimonial.deleted',
    aggregateType: 'testimonial',
    aggregateId: testimonialId,
    actorUserId: user.id,
    payload: { testimonialId, userId: user.id },
  });
  return NextResponse.json({ success: true });
}
