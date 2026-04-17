import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'Terms governing your use of Proofengine.',
  path: '/terms',
});

const terms = [
  {
    title: 'Service usage',
    body: 'By using Proofengine, you agree to use the platform only for lawful business purposes and in accordance with your customer commitments.',
  },
  {
    title: 'Account responsibility',
    body: 'You are responsible for workspace access management, credential security, and content published under your account.',
  },
  {
    title: 'Customer content',
    body: 'You retain ownership of submitted testimonial content. You are responsible for obtaining required permissions before publishing customer statements.',
  },
  {
    title: 'Billing',
    body: 'Paid plans are billed according to your selected cycle. Subscriptions renew automatically unless canceled before the next billing period.',
  },
  {
    title: 'Availability and changes',
    body: 'We continuously improve Proofengine and may update features, limits, or functionality while maintaining core service commitments.',
  },
  {
    title: 'Contact',
    body: 'For contract or legal questions, contact legal@proofengine.app.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#08070e] dark:text-white relative min-h-screen overflow-x-hidden">
      {/* ── Cosmic background layers ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 bg-[#08070e]" />
        <div className="stars-layer absolute inset-0" />
        <div className="absolute -top-[20%] left-[10%] h-[50rem] w-[60rem] rounded-full bg-violet-900/20 blur-[180px]" />
        <div className="absolute -bottom-[10%] right-[5%] h-[40rem] w-[40rem] rounded-full bg-indigo-900/25 blur-[160px]" />
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

      <main className="landing-fade-in mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="mt-8 font-display text-4xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-base leading-7 text-slate-600 dark:text-white/50">
          Effective date: April 15, 2026. These terms describe how Proofengine services are provided and used.
        </p>

        <div className="mt-12 space-y-6">
          {terms.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/60">{section.body}</p>
            </article>
          ))}
        </div>
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
