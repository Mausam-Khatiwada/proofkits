'use client';

import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { getInitials, getAvatarColor } from '@/components/dashboard/utils';

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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
        { href: '/wall-of-love', label: 'Wall of Love', icon: Heart },
        { href: '/embed-library', label: 'Embed Library', icon: Code2 },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
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
        className="fixed top-3 left-4 z-40 md:hidden p-2 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-full w-[220px] flex-col border-r border-[var(--dash-sidebar-border)] bg-[var(--dash-sidebar-bg)] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-base text-[var(--dash-sidebar-title)]">ProofKits</span>
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
              return (
                <Link
                  key={`${group.label}-${item.label}`}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer mb-0.5 ${
                    active
                      ? 'bg-[var(--dash-sidebar-link-active-bg)] text-[var(--dash-sidebar-link-active-text)] shadow-[inset_2px_0_0_var(--dash-sidebar-link-active-bar)]'
                      : 'text-[var(--dash-sidebar-link)] hover:text-[var(--dash-sidebar-link-hover)] hover:bg-[var(--dash-sidebar-link-hover-bg)]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="bg-violet-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center ml-auto font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

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
