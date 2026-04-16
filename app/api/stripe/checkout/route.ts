import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createDodoCheckoutSession,
  createDodoCustomer,
  createDodoCustomerPortalSession,
  getBillingBaseUrl,
} from '@/lib/dodo';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: Request) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  try {
    const productId = process.env.DODO_PRODUCT_ID_PRO;
    if (!productId) {
      return NextResponse.json({ error: 'Billing is temporarily unavailable.' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logSecurityEvent({ action: 'billing.checkout.start', outcome: 'denied', detail: 'unauthorized', request });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit({
      request,
      scope: 'auth_billing_checkout_start',
      limit: 12,
      windowMs: 60_000,
      keyExtras: [user.id],
    });
    if (rateLimitResponse) {
      logSecurityEvent({ action: 'billing.checkout.start', outcome: 'denied', userId: user.id, detail: 'rate_limited', request });
      return rateLimitResponse;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, dodo_customer_id, dodo_subscription_id, email, full_name')
      .eq('id', user.id)
      .single();

    const legacyProfileResult = !profile && profileError
      ? await supabase
          .from('profiles')
          .select('plan, stripe_customer_id, stripe_subscription_id, email, full_name')
          .eq('id', user.id)
          .single()
      : null;

    const effectiveProfile = profile
      ? profile
      : legacyProfileResult?.data
        ? {
            ...legacyProfileResult.data,
            dodo_customer_id: legacyProfileResult.data.stripe_customer_id,
            dodo_subscription_id: legacyProfileResult.data.stripe_subscription_id,
          }
        : null;

    let customerId = effectiveProfile?.dodo_customer_id ?? null;

    if (!customerId) {
      const customer = await createDodoCustomer({
        email: effectiveProfile?.email ?? user.email ?? '',
        name: effectiveProfile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Customer',
        supabaseUserId: user.id,
      });
      customerId = customer.customer_id;

      const { error: updateCustomerError } = await supabase
        .from('profiles')
        .update({ dodo_customer_id: customerId })
        .eq('id', user.id);
      if (updateCustomerError) {
        const { error: legacyUpdateError } = await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
        if (legacyUpdateError) {
          logSecurityEvent({ action: 'billing.checkout.start', outcome: 'error', userId: user.id, detail: 'profile_billing_id_save_failed', request });
          return NextResponse.json({ error: 'Unable to save billing customer profile.' }, { status: 500 });
        }
      }
    }

    if (effectiveProfile?.plan === 'pro' && effectiveProfile?.dodo_subscription_id) {
      const portalSession = await createDodoCustomerPortalSession(customerId);
      logSecurityEvent({ action: 'billing.checkout.start', outcome: 'success', userId: user.id, detail: 'already_subscribed_redirect_portal', request });
      return NextResponse.json({ url: portalSession.link, alreadySubscribed: true });
    }

    const appUrl = getBillingBaseUrl();
    const session = await createDodoCheckoutSession({
      customerId,
      productId,
      returnUrl: `${appUrl}/dashboard?upgraded=true`,
      supabaseUserId: user.id,
    });

    if (!session.checkout_url) {
      logSecurityEvent({ action: 'billing.checkout.start', outcome: 'error', userId: user.id, detail: 'missing_checkout_url', request });
      return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 });
    }

    logSecurityEvent({ action: 'billing.checkout.start', outcome: 'success', userId: user.id, request });
    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logSecurityEvent({ action: 'billing.checkout.start', outcome: 'error', detail: message, request });
    return NextResponse.json({ error: `Checkout failed: ${message}` }, { status: 500 });
  }
}
