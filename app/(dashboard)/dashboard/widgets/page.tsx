import { createClient } from '@/lib/supabase/server';
import { WidgetsContent } from './widgets-content';
import type { Widget, Testimonial } from '@/lib/types';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

export default async function WidgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { plan } = await resolveBillingContextForUser({ supabase, user: user! });

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
      .in('widget_id', widgetIds);
    testimonials = data ?? [];
  }

  const widgetsWithCounts = (widgets ?? []).map((w: Widget) => {
    const wTestimonials = testimonials.filter((t) => t.widget_id === w.id);
    return {
      ...w,
      testimonial_count: wTestimonials.length,
      approved_count: wTestimonials.filter((t) => t.approved).length,
    };
  });

  return <WidgetsContent widgets={widgetsWithCounts} userPlan={plan} />;
}
