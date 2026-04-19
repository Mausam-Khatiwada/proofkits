'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Inbox,
  Layers,
  Heart,
  Code2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Palette,
  Lock,
  Zap,
} from 'lucide-react';
import { getInitials, getAvatarColor } from '@/components/dashboard/utils';
import { canAccessPricingFeature, getUpgradeHref, type PricingFeature } from '@/lib/billing/plans';

interface SidebarProps {
  email: string;
  plan: string;
  fullName: string | null;
  pendingCount: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  feature?: PricingFeature;
}

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.label === 'Dashboard')
    return pathname === '/dashboard';
  if (item.label === 'Widgets')
    return pathname.startsWith('/dashboard/widgets');
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

export function Sidebar({ email, plan, fullName, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'MAIN',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            {
              href: '/inbox',
              label: 'Inbox',
              icon: Inbox,
          badge: pendingCount > 0 ? String(pendingCount) : undefined,
        },
      ],
    },
    {
      label: 'MANAGE',
      items: [
        { href: '/dashboard/widgets', label: 'Widgets', icon: Layers },
        { href: '/wall-of-love', label: 'Wall of Love', icon: Heart, feature: 'wall_of_love' },
        { href: '/embed-library', label: 'Embed Library', icon: Code2 },
        { href: '/style-gallery', label: 'Style Gallery', icon: Palette },
        { href: '/analytics', label: 'Analytics', icon: BarChart3, feature: 'analytics' },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [{ href: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const displayName = fullName || email.split('@')[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-3 z-40 rounded-xl border border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-surface)_85%,transparent)] p-2 text-[var(--dash-text)] shadow-lg backdrop-blur-xl md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(100%,280px)] sm:w-[240px] flex-col border-r border-[var(--dash-sidebar-border)] bg-[var(--dash-sidebar-bg)] shadow-[4px_0_48px_-12px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-300 dark:shadow-[4px_0_60px_-8px_rgba(0,0,0,0.55)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 shadow-[0_8px_24px_-6px_rgba(91,61,245,0.55)] ring-1 ring-white/20">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-[var(--dash-sidebar-title)]">Proofengine</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-[var(--dash-sidebar-label)] hover:text-[var(--dash-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>
      <div className="mx-5 h-px bg-[var(--dash-sidebar-border)]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-widest text-[var(--dash-sidebar-label)] mb-2 mt-6 px-3 font-medium">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item, pathname);
              const accessible = !item.feature || canAccessPricingFeature(plan, item.feature);
              const href = !accessible && item.feature ? getUpgradeHref(item.feature) : item.href;
              return (
                <Link
                  key={`${group.label}-${item.label}`}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`mb-0.5 flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? 'bg-[var(--dash-sidebar-link-active-bg)] text-[var(--dash-sidebar-link-active-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10'
                      : 'text-[var(--dash-sidebar-link)] hover:bg-[var(--dash-sidebar-link-hover-bg)] hover:text-[var(--dash-sidebar-link-hover)]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {!accessible ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                      <Lock className="h-3 w-3" />
                      PRO
                    </span>
                  ) : item.badge ? (
                    <span className="bg-violet-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center ml-auto font-medium">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {plan !== 'pro' && (
        <div className="px-3 pb-2">
          <Link
            href={getUpgradeHref('unlimited_widgets')}
            onClick={() => setIsOpen(false)}
            className="dash-glass group block rounded-2xl p-3.5 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg ring-1 ring-white/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-bold tracking-wide text-[var(--dash-text)]">Upgrade to Pro</p>
                <p className="mt-1 text-[11px] leading-snug text-[var(--dash-muted)]">
                  Unlimited widgets, testimonial editor, analytics & more.
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="mt-auto">
        <div className="mx-5 h-px bg-[var(--dash-sidebar-border)]" />
        <div className="p-4">
          <div className="flex items-center gap-2.5 px-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(
                displayName
              )}`}
            >
              {getInitials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate text-[var(--dash-sidebar-title)]">
                  {displayName}
                </p>
                {plan === 'pro' && (
                  <span className="text-violet-700 dark:text-violet-300 bg-violet-500/20 text-[10px] rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs truncate text-[var(--dash-sidebar-label)]">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--dash-sidebar-link)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 mt-3"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
