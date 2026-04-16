import { createClient } from '@/lib/supabase/server';
import { SettingsContent } from './settings-content';
import type { Profile } from '@/lib/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  // Auto-create profile if it doesn't exist (e.g. trigger wasn't set up before signup)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user!.id,
        email: user!.email ?? '',
        full_name: user!.user_metadata?.full_name ?? null,
        plan: 'free',
      })
      .select()
      .single();
    profile = newProfile;
  }

  const safeProfile: Profile = profile ?? {
    id: user!.id,
    email: user!.email ?? '',
    full_name: null,
    plan: 'free' as const,
    dodo_customer_id: null,
    dodo_subscription_id: null,
    widget_count: 0,
    created_at: new Date().toISOString(),
  };

  return <SettingsContent profile={safeProfile} />;
}
