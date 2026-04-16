import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './components/sidebar';
import { PRIVATE_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  robots: PRIVATE_ROBOTS,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Auto-create profile if it doesn't exist
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? null,
        plan: 'free',
      })
      .select()
      .single();
    profile = newProfile;
  }

  // Fetch real pending testimonial count for sidebar badge
  const { data: widgets } = await supabase
    .from('widgets')
    .select('id')
    .eq('user_id', user.id);

  let pendingCount = 0;
  const widgetIds = (widgets ?? []).map((w: { id: string }) => w.id);
  if (widgetIds.length > 0) {
    const { count } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .in('widget_id', widgetIds)
      .eq('approved', false);
    pendingCount = count ?? 0;
  }

  return (
    <div className="dashboard-theme min-h-screen">
      <Sidebar
        email={user.email ?? ''}
        plan={profile?.plan ?? 'free'}
        fullName={profile?.full_name ?? null}
        pendingCount={pendingCount}
      />
      <main className="ml-[220px] min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)]">
        {children}
      </main>
    </div>
  );
}
