import type { User } from '@supabase/supabase-js';
import { getActiveDodoSubscriptionForCustomer, getActiveDodoSubscriptionForEmail } from '@/lib/dodo';

export async function syncDodoPlanForUser({
  supabase,
  user,
}: {
  supabase: unknown;
  user: User;
}): Promise<'free' | 'pro'> {
  const db = supabase as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null; error?: { message?: string } | null }>;
        };
      };
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: string) => Promise<{ error?: { message?: string } | null }>;
      };
    };
  };

  const { data: primaryProfile, error: primaryError } = await db
    .from('profiles')
    .select('plan, dodo_customer_id, dodo_subscription_id, email')
    .eq('id', user.id)
    .single();

  let profile = primaryProfile;
  if (!profile && primaryError) {
    const { data: legacyProfile } = await db
      .from('profiles')
      .select('plan, stripe_customer_id, stripe_subscription_id, email')
      .eq('id', user.id)
      .single();
    if (legacyProfile) {
      profile = {
        ...legacyProfile,
        dodo_customer_id: legacyProfile.stripe_customer_id,
        dodo_subscription_id: legacyProfile.stripe_subscription_id,
      };
    }
  }

  const currentPlan = profile?.plan === 'pro' ? 'pro' : 'free';
  if (currentPlan === 'pro' && profile?.dodo_subscription_id) {
    return 'pro';
  }

  try {
    const byCustomer =
      typeof profile?.dodo_customer_id === 'string' && profile.dodo_customer_id.length > 0
        ? await getActiveDodoSubscriptionForCustomer(profile.dodo_customer_id)
        : null;

    const byEmail =
      !byCustomer && typeof profile?.email === 'string' && profile.email.length > 0
        ? await getActiveDodoSubscriptionForEmail(profile.email)
        : null;

    const active = byCustomer ?? byEmail;
    if (!active) {
      return currentPlan;
    }

    const updatePayload = {
      plan: 'pro',
      dodo_customer_id: active.customerId,
      dodo_subscription_id: active.subscriptionId,
    };

    const { error: updateError } = await db
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateError) {
      await db
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_customer_id: active.customerId,
          stripe_subscription_id: active.subscriptionId,
        })
        .eq('id', user.id);
    }

    return 'pro';
  } catch {
    return currentPlan;
  }
}
