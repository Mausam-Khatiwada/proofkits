import { createClient } from '@/lib/supabase/server';
import { InboxContent } from './inbox-content';
import type { Widget, Testimonial } from '@/lib/types';

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: widgets } = await supabase
    .from('widgets')
    .select('id, name')
    .eq('user_id', user!.id);

  const widgetIds = (widgets ?? []).map((w: Pick<Widget, 'id'>) => w.id);
  const widgetMap: Record<string, string> = {};
  (widgets ?? []).forEach((w: Pick<Widget, 'id' | 'name'>) => {
    widgetMap[w.id] = w.name;
  });

  let testimonials: Testimonial[] = [];
  if (widgetIds.length > 0) {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .in('widget_id', widgetIds)
      .eq('approved', false)
      .order('created_at', { ascending: false });
    testimonials = (data ?? []) as Testimonial[];
  }

  return <InboxContent testimonials={testimonials} widgetMap={widgetMap} />;
}
