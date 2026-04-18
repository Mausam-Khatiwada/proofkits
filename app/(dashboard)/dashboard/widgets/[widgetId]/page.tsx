import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { WidgetDetail } from './widget-detail';
import type { Widget, Testimonial } from '@/lib/types';
import { getAiUsageSnapshot } from '@/lib/billing/plans';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

export default async function WidgetDetailPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { profile, plan } = await resolveBillingContextForUser({ supabase, user: user!, syncPlan: true });

  const { data: widget } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', widgetId)
    .eq('user_id', user!.id)
    .single();

  if (!widget) {
    notFound();
  }

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('widget_id', widgetId)
    .order('created_at', { ascending: false });

  return (
    <WidgetDetail
      widget={widget as Widget}
      testimonials={(testimonials ?? []) as Testimonial[]}
      userPlan={plan}
      aiUsage={getAiUsageSnapshot(plan, profile)}
    />
  );
}
