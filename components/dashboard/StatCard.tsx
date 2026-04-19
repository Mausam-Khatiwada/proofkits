'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: number;
  decimals?: number;
  label: string;
  trend?: string;
  trendPositive?: boolean;
  suffix?: string;
  prefix?: string;
  subText?: string;
  subColor?: string;
  renderExtra?: () => ReactNode;
}

export function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  decimals = 0,
  label,
  trend,
  trendPositive = true,
  suffix = '',
  prefix = '',
  subText,
  subColor = 'text-emerald-600',
  renderExtra,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = 40;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(
          decimals > 0
            ? parseFloat(current.toFixed(decimals))
            : Math.floor(current)
        );
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value, decimals]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : displayValue.toLocaleString();

  return (
    <div className="dash-glass p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={`${iconBg} rounded-xl p-2.5`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span
            className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-3 tabular-nums">
        {prefix}
        {formatted}
        {suffix}
      </p>
      <p className="text-sm text-[#7C6D9A]">{label}</p>
      {subText && <p className={`text-xs mt-1 ${subColor}`}>{subText}</p>}
      {renderExtra?.()}
    </div>
  );
}
