import { Bell, Plus } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--dash-border)] bg-[var(--dash-surface)] pl-14 pr-4 md:px-8 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-[var(--dash-text)]">Dashboard</h1>
        <p className="-mt-0.5 text-sm text-[var(--dash-muted)]">
          {greeting}, {firstName} 👋
        </p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle className="border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-muted)]" />
        <Link
          href="/inbox"
          className="relative rounded-lg p-2 text-[var(--dash-muted)] transition-colors hover:text-violet-600"
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Link>
        <div className="mx-1 h-5 w-px bg-[var(--dash-border)] hidden sm:block" />
        {canCreateWidget ? (
          <button
            type="button"
            onClick={onNewWidget}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white text-sm font-medium px-3 py-2 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Widget</span>
          </button>
        ) : (
          <Link
            href={upgradeHref}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white text-sm font-medium px-3 py-2 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upgrade for More</span>
          </Link>
        )}
      </div>
    </header>
  );
}
