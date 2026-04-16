import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDodoCustomerPortalSession } from '@/lib/dodo';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: Request) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logSecurityEvent({ action: 'billing.portal.start', outcome: 'denied', detail: 'unauthorized', request });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      request,
      scope: 'auth_billing_portal_start',
      limit: 20,
      windowMs: 60_000,
      keyExtras: [user.id],
    });
    if (rateLimitResponse) {
      logSecurityEvent({ action: 'billing.portal.start', outcome: 'denied', userId: user.id, detail: 'rate_limited', request });
      return rateLimitResponse;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dodo_customer_id')
      .eq('id', user.id)
      .single();

    const legacyProfileResult = !profile && profileError
      ? await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', user.id)
          .single()
      : null;

    const customerId = profile?.dodo_customer_id ?? legacyProfileResult?.data?.stripe_customer_id ?? null;

    if (!customerId) {
      logSecurityEvent({ action: 'billing.portal.start', outcome: 'denied', userId: user.id, detail: 'missing_customer_id', request });
      return NextResponse.json(
        { error: 'No billing account found. Start a subscription first.' },
        { status: 400 }
      );
    }

    const session = await createDodoCustomerPortalSession(customerId);

    logSecurityEvent({ action: 'billing.portal.start', outcome: 'success', userId: user.id, request });
    return NextResponse.json({ url: session.link });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logSecurityEvent({ action: 'billing.portal.start', outcome: 'error', detail: message, request });
    return NextResponse.json({ error: `Billing portal failed: ${message}` }, { status: 500 });
  }
}
