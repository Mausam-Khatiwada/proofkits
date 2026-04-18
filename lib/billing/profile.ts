import type { User } from '@supabase/supabase-js';
import { syncDodoPlanForUser } from '@/lib/billing/sync-dodo-plan';
import { normalizePlan } from '@/lib/billing/plans';
import type { Plan } from '@/lib/types';

export interface BillingProfileRecord {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  widget_count: number;
  ai_requests_used: number;
  ai_requests_period: string | null;
  created_at: string | null;
}

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: BillingProfileRecord | null; error?: { message?: string } | null }>;
      };
    };
    upsert: (values: Record<string, unknown>) => {
      select: (columns: string) => {
        single: () => Promise<{ data: BillingProfileRecord | null; error?: { message?: string } | null }>;
      };
    };
  };
};

const BILLING_PROFILE_COLUMNS =
  'id, email, full_name, plan, dodo_customer_id, dodo_subscription_id, widget_count, ai_requests_used, ai_requests_period, created_at';

function asSupabaseLike(supabase: unknown): SupabaseLike {
  return supabase as SupabaseLike;
}

function getFallbackProfile(user: User): BillingProfileRecord {
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
    plan: 'free',
    dodo_customer_id: null,
    dodo_subscription_id: null,
    widget_count: 0,
    ai_requests_used: 0,
    ai_requests_period: null,
    created_at: null,
  };
}

export async function ensureBillingProfile({
  supabase,
  user,
}: {
  supabase: unknown;
  user: User;
}): Promise<BillingProfileRecord> {
  const db = asSupabaseLike(supabase);
  const { data: existingProfile } = await db
    .from('profiles')
    .select(BILLING_PROFILE_COLUMNS)
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  const fallbackProfile = getFallbackProfile(user);
  const { data: createdProfile } = await db
    .from('profiles')
    .upsert({
      id: fallbackProfile.id,
      email: fallbackProfile.email,
      full_name: fallbackProfile.full_name,
      plan: fallbackProfile.plan,
      ai_requests_used: fallbackProfile.ai_requests_used,
      ai_requests_period: fallbackProfile.ai_requests_period,
    })
    .select(BILLING_PROFILE_COLUMNS)
    .single();

  return createdProfile ?? fallbackProfile;
}

export async function resolveBillingContextForUser({
  supabase,
  user,
  syncPlan = false,
}: {
  supabase: unknown;
  user: User;
  syncPlan?: boolean;
}): Promise<{ profile: BillingProfileRecord; plan: Plan }> {
  const profile = await ensureBillingProfile({ supabase, user });
  const syncedPlan = syncPlan ? await syncDodoPlanForUser({ supabase, user }) : null;
  const plan = normalizePlan(syncedPlan ?? profile.plan);

  if (profile.plan === plan) {
    return { profile, plan };
  }

  return {
    profile: {
      ...profile,
      plan,
    },
    plan,
  };
}
