'use client';

import { useEffect, useState } from 'react';

const dailyData = [
  { day: 'Mon', rate: 60 },
  { day: 'Tue', rate: 45 },
  { day: 'Wed', rate: 80 },
  { day: 'Thu', rate: 73 },
  { day: 'Fri', rate: 90 },
  { day: 'Sat', rate: 65 },
  { day: 'Sun', rate: 73 },
];

export function ResponseRate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dash-glass p-5 transition-shadow duration-300 hover:-translate-y-0.5">
      <h3 className="font-semibold text-sm text-gray-800">Response Rate</h3>
      <p className="text-4xl font-bold text-violet-600 mt-3 tabular-nums">73%</p>
      <p className="text-xs text-emerald-600">↑ 8% from last month</p>

      <div className="mt-4 flex justify-between gap-2 h-32">
        {dailyData.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-full max-w-[24px] bg-violet-100 rounded-full relative overflow-hidden flex-1 min-h-0">
              <div
                className="absolute bottom-0 left-0 right-0 bg-violet-500 rounded-full transition-all duration-700 ease-out"
                style={{ height: mounted ? `${d.rate}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{d.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-100" />
          <span className="text-xs text-gray-400">Sent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-xs text-gray-400">Replied</span>
        </div>
      </div>
    </div>
  );
}
