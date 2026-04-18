import { createClient } from '@/lib/supabase/server';
import { StyleGalleryContent } from './style-gallery-content';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

export default async function StyleGalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { plan } = await resolveBillingContextForUser({ supabase, user: user!, syncPlan: true });

  const { data: widgets } = await supabase
    .from('widgets')
    .select('id, name, slug')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <StyleGalleryContent
      widgets={(widgets ?? []).map((w: { id: string; name: string; slug: string }) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
      }))}
      userPlan={plan}
    />
  );
}
