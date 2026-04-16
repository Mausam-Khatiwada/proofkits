import { createClient } from '@/lib/supabase/server';
import {
  MessageSquare,
  Star,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import type { Widget, Testimonial } from '@/lib/types';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user!.id);

  const widgetIds = (widgets ?? []).map((w: Widget) => w.id);

  let testimonials: Testimonial[] = [];
  if (widgetIds.length > 0) {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .in('widget_id', widgetIds);
    testimonials = (data ?? []) as Testimonial[];
  }

  const total = testimonials.length;
  const approved = testimonials.filter((t) => t.approved).length;
  const pending = total - approved;
  const avgRating =
    total > 0
      ? (testimonials.reduce((s, t) => s + t.rating, 0) / total).toFixed(1)
      : '0.0';
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Rating distribution
  const ratingDist = [0, 0, 0, 0, 0];
  testimonials.forEach((t) => {
    if (t.rating >= 1 && t.rating <= 5) ratingDist[t.rating - 1]++;
  });
  const maxCount = Math.max(...ratingDist, 1);

  // Per-widget stats
  const widgetStats = (widgets ?? []).map((w: Widget) => {
    const wt = testimonials.filter((t) => t.widget_id === w.id);
    return {
      name: w.name,
      total: wt.length,
      approved: wt.filter((t) => t.approved).length,
      avgRating:
        wt.length > 0
          ? (wt.reduce((s, t) => s + t.rating, 0) / wt.length).toFixed(1)
          : '—',
    };
  });

  const stats = [
    {
      label: 'Total Testimonials',
      value: total.toString(),
      icon: MessageSquare,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Approved',
      value: approved.toString(),
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Pending Review',
      value: pending.toString(),
      icon: TrendingUp,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Average Rating',
      value: `${avgRating} ★`,
      icon: Star,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            Overview of your testimonial performance
          </p>
        </div>
      </header>

      <div className="px-4 py-6 md:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 border border-[#EDE9FE] shadow-[0_1px_3px_rgba(124,58,237,0.06)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200"
              >
                <div className={`${s.iconBg} rounded-xl p-2.5 w-fit`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-3 tabular-nums">
                  {s.value}
                </p>
                <p className="text-sm text-[#7C6D9A]">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Rating Distribution
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDist[rating - 1];
                const pct = (count / maxCount) * 100;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-6 text-right">
                      {rating}★
                    </span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Rate */}
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Approval Rate
            </h3>
            <p className="text-5xl font-bold text-violet-600 tabular-nums">
              {approvalRate}%
            </p>
            <p className="text-xs text-[#7C6D9A] mt-1">
              {approved} of {total} testimonials approved
            </p>

            {/* Donut-style visual */}
            <div className="mt-6 flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#EDE9FE"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="4"
                    strokeDasharray={`${approvalRate} ${100 - approvalRate}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                  <span className="text-xs text-gray-600">
                    Approved ({approved})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-100" />
                  <span className="text-xs text-gray-600">
                    Pending ({pending})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Per-widget breakdown */}
        {widgetStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 mt-5 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Performance by Widget
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-[#7C6D9A] uppercase tracking-wide">
                      Widget
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-[#7C6D9A] uppercase tracking-wide">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-[#7C6D9A] uppercase tracking-wide">
                      Approved
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-[#7C6D9A] uppercase tracking-wide">
                      Avg Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {widgetStats.map((ws) => (
                    <tr key={ws.name} className="hover:bg-violet-50/30">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {ws.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {ws.total}
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {ws.approved}
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {ws.avgRating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
