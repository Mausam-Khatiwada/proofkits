import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, Mail, MessageSquare, ShieldCheck, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Contact Proofengine sales and support for onboarding, pricing guidance, and integration questions.',
  path: '/contact',
});

const channels = [
  {
    title: 'Sales and onboarding',
    detail: 'Get rollout guidance, architecture support, and plan recommendations for your team.',
    action: 'sales@proofengine.app',
    icon: MessageSquare,
  },
  {
    title: 'Product support',
    detail: 'Questions about setup, widgets, moderation, or performance? We can help directly.',
    action: 'support@proofengine.app',
    icon: Mail,
  },
  {
    title: 'Security and compliance',
    detail: 'Need documentation for procurement and internal reviews? Contact our trust team.',
    action: 'security@proofengine.app',
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#08070e] dark:text-white relative min-h-screen overflow-x-hidden">
      {/* ── Cosmic background layers ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 bg-[#08070e]" />
        <div className="stars-layer absolute inset-0" />
        <div className="absolute -top-[20%] left-[10%] h-[50rem] w-[60rem] rounded-full bg-violet-900/20 blur-[180px]" />
        <div className="absolute -top-[10%] right-[5%] h-[40rem] w-[40rem] rounded-full bg-indigo-900/25 blur-[160px]" />
      </div>

      <header className="relative z-50 border-b border-slate-200 dark:border-white/[0.06]">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Main"
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-transform duration-300 group-hover:scale-105">
              <span className="text-sm font-bold leading-none text-white">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Proofengine</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <Link href="/#features" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
              Features
            </Link>
            <Link href="/#platform" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
              Platform
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/12 dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white sm:inline-flex"
            >
              Log in
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all hover:bg-violet-500 dark:shadow-[0_0_24px_rgba(139,92,246,0.35)] dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              Engine
            </Link>
          </div>
        </nav>
      </header>

      <main className="landing-fade-in mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-violet-300">
            Contact
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-5xl">
            We help teams ship better social proof faster
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-600 dark:text-white/50 sm:text-lg">
            Reach out for onboarding support, deployment guidance, or security documentation. We usually reply within one business day.
          </p>
        </div>

        <section className="mt-14 grid gap-5 lg:grid-cols-3">
          {channels.map(({ title, detail, action, icon: Icon }) => (
            <article
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
            >
              <div className="mb-6 inline-flex rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/50">{detail}</p>
              <a href={`mailto:${action}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200 transition-colors">
                {action}
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-900 dark:text-white">Support SLA</h2>
          <p className="mt-4 flex items-start gap-2 text-sm leading-7 text-slate-600 dark:text-white/50">
            <Clock3 className="mt-1 h-5 w-5 text-emerald-500 shrink-0 dark:text-cyan-400" />
            Standard response target is less than 24 business hours. Growth and Scale customers receive priority routing.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 mt-20 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Proofengine</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/35">
              Proof infrastructure for modern SaaS teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-500 dark:text-white/40">
            <Link href="/pricing" className="transition-colors hover:text-slate-900 dark:hover:text-white/70">
              Pricing
            </Link>
            <Link href="/login" className="transition-colors hover:text-slate-900 sm:hidden dark:hover:text-white/70">
              Sign In
            </Link>
            <Link href="/contact" className="transition-colors hover:text-slate-900 dark:hover:text-white/70">
              Contact
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-slate-900 dark:hover:text-white/70">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-slate-900 dark:hover:text-white/70">
              Terms
            </Link>
          </div>

          <p className="text-sm text-slate-400 dark:text-white/30">
            &copy; {new Date().getFullYear()} Proofengine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
