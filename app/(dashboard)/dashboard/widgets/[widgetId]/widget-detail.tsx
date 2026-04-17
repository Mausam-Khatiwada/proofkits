'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  Link as LinkIcon,
  Code2,
  Copy,
  Check,
  CheckCircle,
} from 'lucide-react';
import type { Widget, Testimonial } from '@/lib/types';
import { StarDisplay } from './star-display';
import { WriteAskPanel } from './write-ask-panel';
import { getInitials, getAvatarColor, timeAgo } from '@/components/dashboard/utils';

interface WidgetDetailProps {
  widget: Widget;
  testimonials: Testimonial[];
}

type FilterType = 'all' | 'pending' | 'approved';

export function WidgetDetail({ widget, testimonials }: WidgetDetailProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 h-auto min-h-[4rem] bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex flex-wrap items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {widget.name}
            </h1>
            <p className="text-sm text-[#7C6D9A] -mt-0.5">/{widget.slug}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
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
        </div>

        {/* AI Outreach Generator */}
        <WriteAskPanel widgetId={widget.id} />

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
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-800">
                        {t.author_name}
                      </span>
                      {t.author_role && (
                        <span className="text-gray-400 text-xs">
                          {t.author_role}
                          {t.author_company ? ` at ${t.author_company}` : ''}
                        </span>
                      )}
                    </div>
                    <StarDisplay rating={t.rating} />
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                      {t.body}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1 tracking-wide">
                      {timeAgo(t.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 sm:ml-0 ml-0">
                    <button
                      type="button"
                      onClick={() => toggleApprove(t.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                        t.approved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
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
    </>
  );
}
