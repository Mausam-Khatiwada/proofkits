import { createClient } from '@/lib/supabase/server';
import { SettingsContent } from './settings-content';
import type { Profile } from '@/lib/types';
import { resolveBillingContextForUser } from '@/lib/billing/profile';
import { isPricingFeature, type PricingFeature } from '@/lib/billing/plans';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string | string[] }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { profile, plan } = await resolveBillingContextForUser({ supabase, user: user!, syncPlan: true });
  const params = await searchParams;
  const upgradeParam = Array.isArray(params.upgrade) ? params.upgrade[0] : params.upgrade;
  const upgradeFeature: PricingFeature | null = isPricingFeature(upgradeParam) ? upgradeParam : null;

  const safeProfile: Profile = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    plan,
    dodo_customer_id: profile.dodo_customer_id,
    dodo_subscription_id: profile.dodo_subscription_id,
    widget_count: profile.widget_count ?? 0,
    ai_requests_used: profile.ai_requests_used ?? 0,
    ai_requests_period: profile.ai_requests_period ?? null,
    created_at: profile.created_at ?? new Date().toISOString(),
  };

  return <SettingsContent profile={safeProfile} upgradeFeature={upgradeFeature} />;
}
