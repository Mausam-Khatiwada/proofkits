'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import type { WidgetWithCount, Testimonial } from '@/lib/types';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { TestimonialFeed } from '@/components/dashboard/TestimonialFeed';
import { QuickSend } from '@/components/dashboard/QuickSend';
import { WidgetHealth } from '@/components/dashboard/WidgetHealth';
import { WallOfLove } from '@/components/dashboard/WallOfLove';
import { ApprovalRate } from '@/components/dashboard/ApprovalRate';

interface DashboardContentProps {
  widgets: WidgetWithCount[];
  testimonials: Testimonial[];
  totalTestimonials: number;
  totalApproved: number;
  userName: string;
  userPlan: string;
}

export function DashboardContent({
  widgets,
  testimonials,
  totalTestimonials,
  totalApproved,
  userName,
  userPlan,
}: DashboardContentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const totalPending = totalTestimonials - totalApproved;
  const avgRating =
    totalTestimonials > 0
      ? parseFloat(
          (
            testimonials.reduce((sum, t) => sum + t.rating, 0) /
            testimonials.length
          ).toFixed(1)
        )
      : 0;
  const normalizedPlan = userPlan?.toLowerCase() === 'pro' ? 'pro' : 'free';
  const planLabel = normalizedPlan === 'pro' ? 'Pro Mode' : 'Free Mode';

  return (
    <>
      <TopHeader
        userName={userName}
        onNewWidget={() => setShowForm(true)}
        pendingCount={totalPending}
      />

      <div className="px-4 py-6 md:px-8">
        <div
          className={`mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase ${
            normalizedPlan === 'pro'
              ? 'border-violet-300 bg-violet-100 text-violet-700'
              : 'border-slate-300 bg-slate-100 text-slate-700'
          }`}
        >
          {planLabel}
        </div>

        {/* Create Widget Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={MessageSquare}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            value={totalTestimonials}
            label="Total Testimonials"
            trend={
              totalTestimonials > 0
                ? `${totalTestimonials} collected`
                : undefined
            }
            trendPositive={true}
          />
          <StatCard
            icon={Star}
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            value={avgRating}
            decimals={1}
            label="Average Rating"
            suffix=" ★"
          />
          <StatCard
            icon={CheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            value={totalApproved}
            label="Approved"
            subText={
              totalTestimonials > 0
                ? `${Math.round((totalApproved / totalTestimonials) * 100)}% approval rate`
                : undefined
            }
            subColor="text-emerald-600"
          />
          <StatCard
            icon={totalPending > 0 ? Clock : Layers}
            iconBg={totalPending > 0 ? 'bg-amber-100' : 'bg-blue-100'}
            iconColor={
              totalPending > 0 ? 'text-amber-600' : 'text-blue-600'
            }
            value={totalPending > 0 ? totalPending : widgets.length}
            label={totalPending > 0 ? 'Pending Review' : 'Active Widgets'}
          />
        </div>

        {/* Main Content Area */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Left: Testimonial Feed (2/3) */}
          <div className="xl:col-span-2">
            <TestimonialFeed testimonials={testimonials} />
          </div>

          {/* Right: Quick Actions (1/3) */}
          <div className="flex flex-col gap-4 xl:col-span-1">
            <QuickSend widgets={widgets} />
            <WidgetHealth widgets={widgets} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <WallOfLove testimonials={testimonials} />
          <ApprovalRate total={totalTestimonials} approved={totalApproved} />
        </div>
      </div>
    </>
  );
}
