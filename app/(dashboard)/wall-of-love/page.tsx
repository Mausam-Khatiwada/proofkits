import { createClient } from '@/lib/supabase/server';
import { Heart, Star, CheckCircle } from 'lucide-react';
import type { Widget, Testimonial } from '@/lib/types';
import { getInitials, getAvatarColor } from '@/components/dashboard/utils';

export default async function WallOfLovePage() {
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
      .eq('approved', true)
      .order('rating', { ascending: false });
    testimonials = (data ?? []) as Testimonial[];
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] px-8 flex items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Wall of Love ❤️
          </h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            {testimonials.length} approved testimonial
            {testimonials.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div className="px-8 py-6">
        {testimonials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-16 text-center">
            <Heart className="w-12 h-12 text-violet-200 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">
              No approved testimonials yet
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Approve testimonials from your inbox to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200"
              >
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= t.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic leading-relaxed mb-4">
                  &ldquo;{t.body}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(
                      t.author_name
                    )}`}
                  >
                    {getInitials(t.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-700">
                        {t.author_name}
                      </span>
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </div>
                    {(t.author_role || t.author_company) && (
                      <p className="text-[10px] text-gray-400 truncate">
                        {[t.author_role, t.author_company]
                          .filter(Boolean)
                          .join(' at ')}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300">
                    {widgetMap[t.widget_id]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
