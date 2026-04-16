'use client';

import { useRouter } from 'next/navigation';
import { Inbox, CheckCircle, Trash2, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { getInitials, getAvatarColor, timeAgo } from '@/components/dashboard/utils';

interface InboxContentProps {
  testimonials: Testimonial[];
  widgetMap: Record<string, string>;
}

export function InboxContent({ testimonials, widgetMap }: InboxContentProps) {
  const router = useRouter();

  async function handleApprove(id: string) {
    await fetch(`/api/testimonials/${id}/approve`, { method: 'PATCH' });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8">
        {testimonials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-16 text-center">
            <Inbox className="w-12 h-12 text-violet-200 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">Inbox zero! 🎉</p>
            <p className="text-sm text-gray-300 mt-1">
              All testimonials have been reviewed
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] overflow-hidden shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <div className="divide-y divide-gray-50">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="px-4 py-5 md:px-6 hover:bg-violet-50/30 transition-colors group flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-amber-300 ring-offset-2 ${getAvatarColor(
                      t.author_name
                    )}`}
                  >
                    {getInitials(t.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">
                        {t.author_name}
                      </span>
                      <span className="text-[10px] rounded-full px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                      <span className="text-xs text-gray-300">
                        {widgetMap[t.widget_id] ?? 'Unknown widget'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i <= t.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">
                      {t.body}
                    </p>
                    {(t.author_role || t.author_company) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {[t.author_role, t.author_company]
                          .filter(Boolean)
                          .join(' at ')}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-300 mt-1 tracking-wide">
                      {timeAgo(t.created_at)}
                    </p>
                  </div>
                  </div>
                  <div className="flex items-center sm:items-start gap-2 sm:mt-0 pt-2 sm:pt-0 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(t.id)}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-emerald-200"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
