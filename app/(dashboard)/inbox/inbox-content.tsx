'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inbox, CheckCircle, Trash2, Star, Pencil, Lock } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { getUpgradeHref, type AiUsageSnapshot } from '@/lib/billing/plans';
import { TestimonialEditorModal } from '@/components/dashboard/TestimonialEditorModal';
import { getInitials, getAvatarColor, timeAgo } from '@/components/dashboard/utils';

interface InboxContentProps {
  testimonials: Testimonial[];
  widgetMap: Record<string, string>;
  userPlan: string;
  aiUsage: AiUsageSnapshot;
}

export function InboxContent({ testimonials, widgetMap, userPlan, aiUsage }: InboxContentProps) {
  const router = useRouter();
  const isPro = userPlan?.toLowerCase() === 'pro';
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [aiUsageState, setAiUsageState] = useState(aiUsage);

  useEffect(() => {
    setAiUsageState(aiUsage);
  }, [aiUsage]);

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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--dash-border)] bg-[var(--dash-surface)] pl-14 pr-4 backdrop-blur-xl md:px-8">
        <div>
          <h1 className="text-lg font-semibold text-[var(--dash-text)]">Inbox</h1>
          <p className="-mt-0.5 text-sm text-[var(--dash-muted)]">
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8">
        {testimonials.length === 0 ? (
          <div className="dash-glass p-16 text-center">
            <Inbox className="w-12 h-12 text-violet-200 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">Inbox zero! 🎉</p>
            <p className="text-sm text-gray-300 mt-1">
              All testimonials have been reviewed
            </p>
          </div>
        ) : (
          <div className="dash-glass overflow-hidden">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--dash-text)]">
                        {t.author_name}
                      </span>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-300/40">
                        Pending
                      </span>
                      <span className="text-xs text-[var(--dash-muted)]">
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
                              : 'text-[color:color-mix(in_srgb,var(--dash-soft)_55%,transparent)]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--dash-text)]">
                      {t.body}
                    </p>
                    {(t.author_role || t.author_company) && (
                      <p className="mt-1 text-xs text-[var(--dash-muted)]">
                        {[t.author_role, t.author_company]
                          .filter(Boolean)
                          .join(' at ')}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] tracking-wide text-[var(--dash-soft)]">
                      {timeAgo(t.created_at)}
                    </p>
                  </div>
                  </div>
                  <div className="flex items-center sm:items-start gap-2 sm:mt-0 pt-2 sm:pt-0 flex-shrink-0">
                    {isPro ? (
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--dash-text)] transition-colors hover:border-violet-300/50 hover:bg-violet-500/15 hover:text-violet-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    ) : (
                      <Link
                        href={getUpgradeHref('testimonial_editor')}
                        className="flex items-center gap-1.5 rounded-xl border border-violet-300/50 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-500/25"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleApprove(t.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
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

      {isPro ? (
        <TestimonialEditorModal
          testimonial={editing}
          open={editing !== null}
          onClose={() => setEditing(null)}
          userPlan={userPlan}
          aiUsage={aiUsageState}
          onSaved={() => router.refresh()}
          onAiUsageChange={setAiUsageState}
        />
      ) : null}
    </>
  );
}
