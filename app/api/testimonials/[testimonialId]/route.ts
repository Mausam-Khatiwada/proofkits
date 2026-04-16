import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { requireAuthenticatedUser, requireTestimonialOwner } from '@/lib/security/permissions';
import { emitDomainEvent } from '@/lib/events/outbox';

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
