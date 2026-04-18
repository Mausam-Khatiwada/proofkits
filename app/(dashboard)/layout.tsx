import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './components/sidebar';
import { PRIVATE_ROBOTS } from '@/lib/seo';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

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

  const { profile, plan } = await resolveBillingContextForUser({ supabase, user });

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
        plan={plan}
        fullName={profile.full_name ?? null}
        pendingCount={pendingCount}
      />
      <main className="md:ml-[220px] min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)] transition-[margin] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
