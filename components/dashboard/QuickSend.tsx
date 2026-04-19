'use client';

import { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  Layers,
} from 'lucide-react';
import type { WidgetWithCount } from '@/lib/types';

interface QuickSendProps {
  widgets: WidgetWithCount[];
}

export function QuickSend({ widgets }: QuickSendProps) {
  const [selectedWidget, setSelectedWidget] = useState(
    widgets.length > 0 ? widgets[0].id : ''
  );
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';

  const selectedSlug =
    widgets.find((w) => w.id === selectedWidget)?.slug ?? '';
  const collectionUrl = `${appUrl}/collect/${selectedSlug}`;

  async function handleCopyLink() {
    if (!selectedSlug) return;
    await navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalTestimonials = widgets.reduce(
    (sum, w) => sum + w.testimonial_count,
    0
  );
  const totalApproved = widgets.reduce(
    (sum, w) => sum + w.approved_count,
    0
  );

  return (
    <div className="dash-glass p-5 transition-shadow duration-300">
      <h3 className="font-semibold text-sm text-gray-800">
        Collect Testimonials
      </h3>
      <p className="text-xs text-gray-400">
        Share a collection link with your customers
      </p>

      {widgets.length === 0 ? (
        <div className="mt-4 text-center py-6">
          <Layers className="w-8 h-8 text-violet-200 mx-auto" />
          <p className="text-sm text-gray-400 mt-2">Create a widget first</p>
          <p className="text-xs text-gray-300">
            Use the &quot;+ New Widget&quot; button above
          </p>
        </div>
      ) : (
        <>
          {/* Widget selector */}
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">Widget</label>
            <select
              value={selectedWidget}
              onChange={(e) => {
                setSelectedWidget(e.target.value);
                setCopied(false);
              }}
              className="w-full cursor-pointer rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none focus:border-transparent focus:ring-2 focus:ring-violet-500"
            >
              {widgets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.testimonial_count} testimonials)
                </option>
              ))}
            </select>
          </div>

          {/* Collection URL */}
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">
              Collection Link
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={collectionUrl}
                className="min-w-0 flex-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2.5 text-sm text-[var(--dash-muted)]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats footer */}
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-1.5">
              <Send className="w-3 h-3 text-gray-300" />
              <span className="text-xs text-gray-400">
                {totalTestimonials} collected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3 text-gray-300" />
              <span className="text-xs text-gray-400">
                {totalApproved} approved
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
