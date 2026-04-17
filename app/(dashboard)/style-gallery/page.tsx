import { createClient } from '@/lib/supabase/server';
import { StyleGalleryContent } from './style-gallery-content';
import { syncDodoPlanForUser } from '@/lib/billing/sync-dodo-plan';

export default async function StyleGalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const effectivePlan = await syncDodoPlanForUser({ supabase, user: user! });

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single();

  const { data: widgets } = await supabase
    .from('widgets')
    .select('id, name, slug')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const userPlan = effectivePlan ?? profile?.plan ?? 'free';

  return (
    <StyleGalleryContent
      widgets={(widgets ?? []).map((w: { id: string; name: string; slug: string }) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
      }))}
      userPlan={userPlan}
    />
  );
}
