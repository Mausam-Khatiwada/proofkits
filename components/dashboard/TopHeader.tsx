import { Bell, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme/theme-toggle';

interface TopHeaderProps {
  userName: string;
  onNewWidget: () => void;
  pendingCount?: number;
  canCreateWidget?: boolean;
  upgradeHref?: string;
}

export function TopHeader({
  userName,
  onNewWidget,
  pendingCount = 0,
  canCreateWidget = true,
  upgradeHref = '/settings',
}: TopHeaderProps) {
  const firstName = userName?.split(' ')[0] || 'there';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-surface)_78%,transparent)] py-3 pl-14 pr-3 backdrop-blur-2xl sm:min-h-[4rem] sm:flex-nowrap sm:py-2 md:px-8">
      <div className="min-w-0 flex-1 sm:flex-none">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--dash-text)]">Dashboard</h1>
        <p className="-mt-0.5 text-sm text-[var(--dash-muted)]">
          {greeting}, {firstName}
        </p>
      </div>

      <div className="order-last hidden min-w-0 flex-1 basis-full px-0 lg:order-none lg:mx-4 lg:block lg:max-w-md lg:basis-auto">
        <div
          className="dash-glass flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm text-[var(--dash-muted)]"
          role="search"
          aria-label="Search (coming soon)"
        >
          <Search className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
          <span className="truncate">Search widgets, testimonials…</span>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <ThemeToggle className="border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-surface)_70%,transparent)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-muted)]" />
        <Link
          href="/inbox"
          className="relative rounded-xl p-2 text-[var(--dash-muted)] transition-colors hover:bg-white/5 hover:text-violet-600"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[9px] font-bold text-white shadow-sm">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Link>
        <div className="mx-0.5 hidden h-6 w-px bg-[var(--dash-border)] sm:block" />
        {canCreateWidget ? (
          <button
            type="button"
            onClick={onNewWidget}
            className="dash-btn-primary flex items-center gap-1.5 px-3 py-2 text-sm sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Widget</span>
          </button>
        ) : (
          <Link
            href={upgradeHref}
            className="dash-btn-primary flex items-center gap-1.5 px-3 py-2 text-sm sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upgrade for More</span>
          </Link>
        )}
      </div>
    </header>
  );
}
