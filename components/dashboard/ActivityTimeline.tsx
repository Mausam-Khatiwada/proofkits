'use client';

import { CheckCircle, Star, Layers } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { timeAgo } from './utils';

interface ActivityTimelineProps {
  testimonials: Testimonial[];
}

export function ActivityTimeline({ testimonials }: ActivityTimelineProps) {
  // Build real activity items from testimonials
  const activities = testimonials.slice(0, 6).map((t) => ({
    id: t.id,
    action: t.approved
      ? `${t.author_name}'s testimonial approved`
      : `New testimonial from ${t.author_name}`,
    detail: `${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)} · ${t.rating}.0 rating`,
    time: timeAgo(t.created_at),
    type: t.approved ? ('approved' as const) : ('new' as const),
    authorName: t.author_name,
  }));

  const typeConfig = {
    new: {
      bg: 'bg-violet-100',
      icon: Star,
      iconColor: 'text-violet-600',
    },
    approved: {
      bg: 'bg-emerald-100',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    },
  };

  return (
    <div className="dash-glass p-5 transition-shadow duration-300 hover:-translate-y-0.5">
      <h3 className="font-semibold text-sm text-gray-800">Recent Activity</h3>

      {activities.length === 0 ? (
        <div className="mt-4 text-center py-8">
          <Layers className="w-8 h-8 text-violet-200 mx-auto" />
          <p className="text-sm text-gray-400 mt-2">No activity yet</p>
          <p className="text-xs text-gray-300">
            Activity will appear as you collect testimonials
          </p>
        </div>
      ) : (
        <div className="mt-4 relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-violet-100" />

          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <div
                key={activity.id}
                className="flex gap-3 mb-4 last:mb-0 relative"
              >
                <div
                  className={`w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center ${config.bg} relative z-10`}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-gray-700 font-medium leading-snug">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-400">{activity.detail}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5 tracking-wide">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
