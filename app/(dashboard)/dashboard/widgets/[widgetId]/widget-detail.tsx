'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  Link as LinkIcon,
  Code2,
  Copy,
  Check,
  CheckCircle,
  Crown,
  Pencil,
  Lock,
} from 'lucide-react';
import type { Widget, Testimonial } from '@/lib/types';
import { StarDisplay } from './star-display';
import { WriteAskPanel } from './write-ask-panel';
import { TestimonialEditorModal } from '@/components/dashboard/TestimonialEditorModal';
import { getInitials, getAvatarColor, timeAgo } from '@/components/dashboard/utils';
import { getUpgradeHref, type AiUsageSnapshot } from '@/lib/billing/plans';

interface WidgetDetailProps {
  widget: Widget;
  testimonials: Testimonial[];
  userPlan: string;
  aiUsage: AiUsageSnapshot;
}

type FilterType = 'all' | 'pending' | 'approved';

export function WidgetDetail({ widget, testimonials, userPlan, aiUsage }: WidgetDetailProps) {
  const router = useRouter();
  const [aiUsageState, setAiUsageState] = useState(aiUsage);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(widget.show_badge);
  const [savingBadge, setSavingBadge] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const isPro = userPlan?.toLowerCase() === 'pro';

  useEffect(() => {
    setAiUsageState(aiUsage);
  }, [aiUsage]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const collectionUrl = `${appUrl}/collect/${widget.slug}`;
  const embedCode = `<div id="proofengine-widget"></div>\n<script src="${appUrl}/widget.js" data-widget-slug="${widget.slug}"></script>`;

  const filtered = testimonials.filter((t) => {
    if (filter === 'pending') return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function toggleApprove(testimonialId: string) {
    await fetch(`/api/testimonials/${testimonialId}/approve`, {
      method: 'PATCH',
    });
    router.refresh();
  }

  async function deleteTestimonial(testimonialId: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${testimonialId}`, { method: 'DELETE' });
    router.refresh();
  }

  async function deleteWidget() {
    if (!confirm('Delete this widget and all its testimonials?')) return;
    await fetch(`/api/widgets/${widget.id}`, { method: 'DELETE' });
    router.push('/dashboard');
    router.refresh();
  }

  async function updateBadgePreference(nextShowBadge: boolean) {
    if (!isPro) return;

    setBadgeError(null);
    setSavingBadge(true);
    try {
      const res = await fetch(`/api/widgets/${widget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_badge: nextShowBadge }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBadgeError(data.error ?? 'Failed to update branding preference');
        setSavingBadge(false);
        return;
      }

      setShowBadge(Boolean(data.show_badge));
    } catch {
      setBadgeError('Failed to update branding preference');
    } finally {
      setSavingBadge(false);
    }
  }

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 flex h-auto min-h-[4rem] flex-wrap items-center justify-between gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] py-2 pl-14 pr-4 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg p-2 text-[var(--dash-soft)] transition-colors hover:bg-violet-500/15 hover:text-violet-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[var(--dash-text)]">
              {widget.name}
            </h1>
            <p className="-mt-0.5 text-sm text-[var(--dash-muted)]">/{widget.slug}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={deleteWidget}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete Widget</span>
          <span className="sm:hidden">Delete</span>
        </button>
      </header>

      <div className="px-4 py-6 md:px-8">
        {/* Collection URL + Embed Code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-xs font-medium text-[#7C6D9A] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              Public Collection URL
            </h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={collectionUrl}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(collectionUrl, 'url')}
                className="px-4 py-2.5 bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 text-gray-600 hover:text-violet-600 rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                {copiedField === 'url' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-xs font-medium text-[#7C6D9A] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Embed Code
            </h3>
            <div className="flex gap-2">
              <pre className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 text-xs overflow-x-auto whitespace-pre leading-relaxed">
                {embedCode}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="px-4 py-2.5 bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 text-gray-600 hover:text-violet-600 rounded-xl text-sm transition-colors self-start flex items-center gap-1.5"
              >
                {copiedField === 'embed' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-xs font-medium text-[#7C6D9A] uppercase tracking-wide mb-3">
              Embed Branding
            </h3>
            <p className="text-sm text-gray-700">
              {showBadge ? 'Powered by Proofengine badge is visible.' : 'Badge is hidden on this widget.'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {isPro
                ? 'Pro can choose whether the badge is shown on embeds.'
                : 'Starter embeds always include the Proofengine badge.'}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Show badge</p>
                <p className="text-xs text-gray-400">
                  {isPro ? 'Toggle anytime for this widget.' : 'Unlock badge removal with Pro.'}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={showBadge}
                onClick={() => updateBadgePreference(!showBadge)}
                disabled={!isPro || savingBadge}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  showBadge ? 'bg-violet-600' : 'bg-gray-300'
                } ${!isPro || savingBadge ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    showBadge ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {!isPro && (
              <a
                href={getUpgradeHref('remove_badge')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
              >
                <Crown className="w-3.5 h-3.5" />
                Unlock Badge Removal
              </a>
            )}
            {badgeError ? (
              <p className="mt-3 text-sm text-red-500">{badgeError}</p>
            ) : null}
          </div>
        </div>

        {/* AI Outreach Generator */}
        <WriteAskPanel widgetId={widget.id} userPlan={userPlan} aiUsage={aiUsageState} />

        {/* Filter + Testimonials */}
        <div className="bg-white rounded-2xl border border-[#EDE9FE] overflow-hidden shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
          <div className="px-4 py-4 md:px-6 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-800">
              Testimonials ({filtered.length})
            </h2>
            <div className="flex gap-1">
              {(['all', 'pending', 'approved'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">No testimonials found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="px-4 py-4 md:px-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-violet-50/30 transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarColor(
                      t.author_name
                    )}`}
                  >
                    {getInitials(t.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--dash-text)]">
                        {t.author_name}
                      </span>
                      {t.author_role && (
                        <span className="text-xs text-[var(--dash-muted)]">
                          {t.author_role}
                          {t.author_company ? ` at ${t.author_company}` : ''}
                        </span>
                      )}
                    </div>
                    <StarDisplay rating={t.rating} />
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--dash-text)]">
                      {t.body}
                    </p>
                    <p className="mt-1 text-[10px] tracking-wide text-[var(--dash-soft)]">
                      {timeAgo(t.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 sm:ml-0 ml-0">
                    {isPro ? (
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="flex items-center gap-1 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--dash-text)] transition-colors hover:border-violet-300/50 hover:bg-violet-500/15 hover:text-violet-700"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    ) : (
                      <Link
                        href={getUpgradeHref('testimonial_editor')}
                        className="flex items-center gap-1 rounded-full border border-violet-300/50 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-500/25"
                      >
                        <Lock className="h-3 w-3" />
                        Edit
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleApprove(t.id)}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        t.approved
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {t.approved ? 'Approved' : 'Pending'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTestimonial(t.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
