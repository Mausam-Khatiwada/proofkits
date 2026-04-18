'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, ChevronRight } from 'lucide-react';
import type { WidgetWithCount } from '@/lib/types';
import { timeAgo } from '@/components/dashboard/utils';
import { getUpgradeHref, getWidgetLimit } from '@/lib/billing/plans';

interface WidgetsContentProps {
  widgets: WidgetWithCount[];
  userPlan: string;
}

export function WidgetsContent({ widgets, userPlan }: WidgetsContentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetLimit = getWidgetLimit(userPlan);
  const hasReachedWidgetLimit = widgetLimit !== null && widgets.length >= widgetLimit;
  const widgetUpgradeHref = getUpgradeHref('unlimited_widgets');

  async function handleCreateWidget(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to create widget');
      setCreating(false);
      return;
    }

    setName('');
    setShowForm(false);
    setCreating(false);
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Widgets</h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            Manage your collection forms
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={hasReachedWidgetLimit}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          New Widget
        </button>
      </header>

      <div className="px-4 py-6 md:px-8">
        {hasReachedWidgetLimit && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-900 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Starter includes 1 widget.</p>
              <p className="text-violet-700">Upgrade to Pro to create unlimited widgets and keep growing your library.</p>
            </div>
            <Link
              href={widgetUpgradeHref}
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Create Widget Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => {
              setShowForm(false);
              setError(null);
            }}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#EDE9FE]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Create New Widget
              </h2>
              <p className="text-sm text-[#7C6D9A] mb-5">
                Give your widget a name — a URL slug will be generated
                automatically.
              </p>
              <form onSubmit={handleCreateWidget}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My SaaS"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Widget'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError(null);
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {widgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] py-16 flex flex-col items-center justify-center text-center">
            <Layers className="w-12 h-12 text-violet-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No widgets yet
            </h3>
            <p className="text-sm text-[#7C6D9A] max-w-sm mb-6">
              Widgets are the collection forms you share with your customers to gather testimonials.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Create your first widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {widgets.map((widget) => {
              const pendingCount = widget.testimonial_count - widget.approved_count;
              
              return (
                <Link
                  key={widget.id}
                  href={`/dashboard/widgets/${widget.id}`}
                  className="bg-white rounded-2xl border border-[#EDE9FE] p-5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all duration-200 group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg">
                      <ClockIcon pendingCount={pendingCount} />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 mb-1 group-hover:text-violet-600 transition-colors">
                    {widget.name}
                  </h3>
                  
                  <p className="text-sm text-[#7C6D9A] mb-5">
                    {widget.testimonial_count} testimonial{widget.testimonial_count !== 1 ? 's' : ''}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[#7C6D9A] text-xs">
                    <span>Created {timeAgo(widget.created_at)}</span>
                    <ChevronRight className="w-4 h-4 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function ClockIcon({ pendingCount }: { pendingCount: number }) {
  if (pendingCount > 0) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {pendingCount} pending
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Up to date
    </span>
  );
}
