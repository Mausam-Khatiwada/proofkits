import { createClient } from '@/lib/supabase/server';
import { DashboardContent } from './dashboard-content';
import type { Widget, Testimonial } from '@/lib/types';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { profile, plan } = await resolveBillingContextForUser({ supabase, user: user!, syncPlan: true });

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const widgetIds = (widgets ?? []).map((w: Widget) => w.id);

  let testimonials: Testimonial[] = [];
  if (widgetIds.length > 0) {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .in('widget_id', widgetIds)
      .order('created_at', { ascending: false });
    testimonials = data ?? [];
  }

  const totalTestimonials = testimonials.length;
  const totalApproved = testimonials.filter((t) => t.approved).length;

  const widgetsWithCounts = (widgets ?? []).map((w: Widget) => {
    const wTestimonials = testimonials.filter((t) => t.widget_id === w.id);
    return {
      ...w,
      testimonial_count: wTestimonials.length,
      approved_count: wTestimonials.filter((t) => t.approved).length,
    };
  });

  return (
    <DashboardContent
      widgets={widgetsWithCounts}
      testimonials={testimonials}
      totalTestimonials={totalTestimonials}
      totalApproved={totalApproved}
      userName={profile.full_name ?? user?.email?.split('@')[0] ?? 'there'}
      userPlan={plan}
    />
  );
}
