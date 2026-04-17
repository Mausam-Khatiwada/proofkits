'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState, useSyncExternalStore } from 'react';

type ThemeName = 'light' | 'dark';

function withFallbackAnimation(fn: () => void) {
  const root = document.documentElement;
  root.classList.add('theme-animating');
  window.setTimeout(() => root.classList.remove('theme-animating'), 1840);
  fn();
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isSwitching, setIsSwitching] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const current = (resolvedTheme ?? theme) as ThemeName | undefined;
  const nextTheme = useMemo<ThemeName>(() => (current === 'dark' ? 'light' : 'dark'), [current]);

  if (!mounted) return null;

  const isDark = current === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex items-center justify-center rounded-full border px-2 py-1.5 text-sm font-semibold backdrop-blur-xl transition-[transform,background-color,color,border-color,box-shadow] duration-200 active:scale-[0.98] ${
        isSwitching ? 'theme-toggle-switching' : ''
      } ${
        isDark
          ? 'border-white/15 bg-white/[0.06] text-white shadow-[0_8px_30px_rgba(15,23,42,0.45)] hover:border-white/25 hover:bg-white/[0.11]'
          : 'border-slate-300/80 bg-white/90 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-slate-400/80 hover:bg-white'
      } ${className}`}
      onClick={(e) => {
        if (isSwitching) return;

        setIsSwitching(true);
        const root = document.documentElement;
        const apply = () => setTheme(nextTheme);

        const startViewTransition: undefined | ((cb: () => void) => { ready: Promise<void>; finished: Promise<void> }) = (
          document as unknown as { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }
        ).startViewTransition?.bind(document);

        if (startViewTransition) {
          const transition = startViewTransition(apply);
          transition.finished.finally(() => {
            setIsSwitching(false);
          });
          return;
        }

        withFallbackAnimation(apply);
        window.setTimeout(() => setIsSwitching(false), 1860);
      }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 dark:ring-white/5" aria-hidden="true" />
      <span className="relative flex items-center gap-1.5 px-0.5">
        <span
          className={`theme-toggle-icon inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 ${
            isDark
              ? 'bg-white/12 text-amber-200 ring-1 ring-white/20'
              : 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80'
          }`}
          aria-hidden="true"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </span>
        <span className="theme-toggle-label px-1 text-[12px] font-semibold tracking-[0.01em]">{isDark ? 'Light' : 'Dark'}</span>
      </span>
    </button>
  );
}
