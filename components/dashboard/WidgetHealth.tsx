import { Layers, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { WidgetWithCount } from '@/lib/types';

interface WidgetHealthProps {
  widgets: WidgetWithCount[];
}

const widgetColors = [
  'bg-violet-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
];

export function WidgetHealth({ widgets }: WidgetHealthProps) {
  return (
    <div className="dash-glass p-5 transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Your Widgets</h3>
        <span className="text-xs text-gray-400">
          {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {widgets.length === 0 ? (
        <div className="mt-4 text-center py-6">
          <Layers className="w-8 h-8 text-violet-200 mx-auto" />
          <p className="text-sm text-gray-400 mt-2">No widgets yet</p>
          <p className="text-xs text-gray-300">
            Create a widget to start collecting
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {widgets.slice(0, 4).map((widget, i) => (
            <Link
              key={widget.id}
              href={`/dashboard/widgets/${widget.id}`}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div
                className={`w-9 h-9 rounded-lg ${
                  widgetColors[i % widgetColors.length]
                } flex items-center justify-center flex-shrink-0`}
              >
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-700 truncate">
                  {widget.name}
                </p>
                <p className="text-xs text-gray-400">
                  {widget.testimonial_count} testimonial
                  {widget.testimonial_count !== 1 ? 's' : ''} ·{' '}
                  {widget.testimonial_count - widget.approved_count} pending
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    widget.testimonial_count - widget.approved_count > 0
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {widgets.length > 0 && (
        <Link
          href="/dashboard/widgets"
          className="block w-full text-violet-600 text-xs text-center mt-3 pt-3 border-t border-gray-50 hover:text-violet-700 transition-colors"
        >
          Manage all →
        </Link>
      )}
    </div>
  );
}
