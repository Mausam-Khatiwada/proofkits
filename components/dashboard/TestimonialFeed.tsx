'use client';

import { useState } from 'react';
import { CheckCircle, Star, Trash2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Testimonial } from '@/lib/types';
import { getInitials, getAvatarColor, timeAgo } from './utils';

type TabId = 'all' | 'pending' | 'approved';

interface TestimonialFeedProps {
  testimonials: Testimonial[];
}

export function TestimonialFeed({ testimonials }: TestimonialFeedProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const router = useRouter();

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: testimonials.length },
    {
      id: 'pending',
      label: 'Pending',
      count: testimonials.filter((t) => !t.approved).length,
    },
    {
      id: 'approved',
      label: 'Approved',
      count: testimonials.filter((t) => t.approved).length,
    },
  ];

  const filtered = testimonials.filter((t) => {
    if (activeTab === 'pending') return !t.approved;
    if (activeTab === 'approved') return t.approved;
    return true;
  });

  async function handleApprove(id: string) {
    await fetch(`/api/testimonials/${id}/approve`, { method: 'PATCH' });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  // Empty state
  if (testimonials.length === 0) {
    return (
      <div className="dash-glass overflow-hidden">
        <div className="dash-glass-header px-6 pb-4 pt-5">
          <h2 className="font-semibold text-gray-800">Recent Testimonials</h2>
        </div>
        <div className="py-16 flex flex-col items-center justify-center">
          <MessageSquare className="w-12 h-12 text-violet-200" />
          <p className="text-gray-400 font-medium mt-3">
            No testimonials yet
          </p>
          <p className="text-sm text-gray-300">
            Share your collection link to start receiving testimonials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-glass overflow-hidden transition-shadow duration-300">
      {/* Header with tabs */}
      <div className="dash-glass-header flex flex-col gap-2 px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <h2 className="font-semibold text-gray-800">Recent Testimonials</h2>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-400">
            No {activeTab} testimonials
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="px-4 py-4 md:px-6 hover:bg-violet-50/30 transition-colors group flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Avatar */}
              <div
                className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(
                  t.author_name
                )} ${
                  t.approved
                    ? 'ring-2 ring-emerald-400 ring-offset-2'
                    : 'ring-2 ring-amber-300 ring-offset-2'
                }`}
              >
                {getInitials(t.author_name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800">
                    {t.author_name}
                  </span>
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 ${
                      t.approved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {t.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {renderStars(t.rating)}
                  {(t.author_role || t.author_company) && (
                    <span className="text-xs text-gray-400">
                      {[t.author_role, t.author_company]
                        .filter(Boolean)
                        .join(' at ')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-1">
                  {t.body}
                </p>
              </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-300 mb-auto">
                  {timeAgo(t.created_at)}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApprove(t.id)}
                    title={t.approved ? 'Unapprove' : 'Approve'}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border border-transparent ${
                      t.approved
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:border-emerald-300'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-600 hover:border-amber-300'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all hover:border-red-300 border border-transparent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {testimonials.length > 5 && (
        <button
          type="button"
          onClick={() => router.push('/inbox')}
          className="w-full text-violet-600 text-sm text-center py-4 border-t border-gray-50 hover:bg-violet-50/30 transition-colors"
        >
          View all {testimonials.length} testimonials →
        </button>
      )}
    </div>
  );
}
