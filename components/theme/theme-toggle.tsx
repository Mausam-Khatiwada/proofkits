'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState, useSyncExternalStore } from 'react';

type ThemeName = 'light' | 'dark';

function withFallbackAnimation(fn: () => void) {
  const root = document.documentElement;
  root.classList.add('theme-animating');
  window.setTimeout(() => root.classList.remove('theme-animating'), 1320);
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
      className={`group inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-semibold backdrop-blur-md transition-[transform,background-color,color,border-color,box-shadow] duration-500 active:scale-[0.98] ${
        isSwitching ? 'theme-toggle-switching' : ''
      } ${className}`}
      onClick={(e) => {
        if (isSwitching) return;

        setIsSwitching(true);
        const root = document.documentElement;
        root.style.setProperty('--vt-x', `${e.clientX}px`);
        root.style.setProperty('--vt-y', `${e.clientY}px`);

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
        window.setTimeout(() => setIsSwitching(false), 1360);
      }}
    >
      <span className="relative flex items-center gap-2">
        <span
          className="theme-toggle-icon inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-300 transition dark:bg-white/10 dark:ring-white/10"
          aria-hidden="true"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-200" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </span>
        <span className="theme-toggle-label hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
      </span>
    </button>
  );
}
