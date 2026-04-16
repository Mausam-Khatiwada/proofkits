import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { requireAuthenticatedUser, requireWidgetOwner } from '@/lib/security/permissions';
import { logOpsEvent } from '@/lib/monitoring/ops';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params;

  if (!isValidUuid(widgetId)) {
    return NextResponse.json({ error: 'Invalid widget ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await requireAuthenticatedUser(supabase);

  if (!user) {
    logOpsEvent({ request, category: 'permission', action: 'widget.testimonials.read', outcome: 'denied', detail: 'unauthorized', targetId: widgetId });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const widget = await requireWidgetOwner({
    supabase,
    userId: user.id,
    widgetId,
    select: 'id, user_id',
  });

  if (!widget) {
    logOpsEvent({ request, category: 'permission', action: 'widget.testimonials.read', outcome: 'denied', userId: user.id, detail: 'not_owner_or_not_found', targetId: widgetId });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('widget_id', widgetId)
    .order('created_at', { ascending: false });

  if (error) {
    logOpsEvent({ request, category: 'widget', action: 'widget.testimonials.read', outcome: 'error', userId: user.id, detail: error.message, targetId: widgetId });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logOpsEvent({ request, category: 'widget', action: 'widget.testimonials.read', outcome: 'success', userId: user.id, targetId: widgetId });
  return NextResponse.json(testimonials);
}
