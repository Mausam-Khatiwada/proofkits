'use client';

import { CheckCircle } from 'lucide-react';

interface ApprovalRateProps {
  total: number;
  approved: number;
}

export function ApprovalRate({ total, approved }: ApprovalRateProps) {
  const pending = total - approved;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-shadow duration-200">
      <h3 className="font-semibold text-sm text-gray-800">Approval Rate</h3>

      {total === 0 ? (
        <div className="mt-4 text-center py-6">
          <CheckCircle className="w-8 h-8 text-violet-200 mx-auto" />
          <p className="text-sm text-gray-400 mt-2">No data yet</p>
          <p className="text-xs text-gray-300">
            Approval stats will appear here
          </p>
        </div>
      ) : (
        <>
          <p className="text-4xl font-bold text-violet-600 mt-3 tabular-nums">
            {rate}%
          </p>
          <p className="text-xs text-[#7C6D9A]">
            {approved} of {total} approved
          </p>

          {/* Donut chart */}
          <div className="mt-5 flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg
                className="w-20 h-20 -rotate-90"
                viewBox="0 0 36 36"
              >
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
                  strokeDasharray={`${rate} ${100 - rate}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="space-y-2.5">
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
        </>
      )}
    </div>
  );
}
