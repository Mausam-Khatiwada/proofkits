import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { pageMetadata } from '@/lib/seo';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    note: 'For early teams validating messaging and customer proof loops.',
    features: ['1 workspace', '3 active widgets', 'Basic moderation', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$29',
    note: 'For SaaS teams shipping social proof across key conversion pages.',
    features: ['Unlimited widgets', 'AI enhancement credits', 'Approval workflow', 'Integrations'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '$99',
    note: 'For multi-team GTM organizations with governance and advanced reporting.',
    features: ['Role-based access', 'Advanced analytics', 'Priority support', 'Custom brand presets'],
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'Pricing',
  description: 'Choose the Proofengine plan that fits your team stage, from first launch to scaled social proof operations.',
  path: '/pricing',
});

export default function PricingPage() {
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
            <Link href="/pricing" className="text-sm font-medium text-slate-900 transition-colors dark:text-white">
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
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-violet-300">
            Pricing
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-5xl">
            Plans designed for every proof maturity stage
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-600 dark:text-white/50 sm:text-lg">
            Start free, validate impact quickly, then scale with governance, analytics, and team collaboration.
          </p>
        </div>

        <section className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]`}
            >
              <p className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-900 dark:text-white">{plan.name}</p>
              <p className="mt-2 text-4xl font-black tracking-[-0.03em] text-slate-900 dark:text-white">
                {plan.price}
                <span className="ml-1 text-base font-medium text-slate-500 dark:text-white/40">/month</span>
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/50">{plan.note}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-500 dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.08]'
                }`}
              >
                Choose {plan.name}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-900 dark:text-white">Need an annual plan or enterprise setup?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-white/50">
            We support annual contracts, onboarding sessions, and custom governance requirements for larger teams.
            Reach out to tailor Proofengine to your stack and rollout plan.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:backdrop-blur-sm dark:hover:border-white/25 dark:hover:bg-white/[0.08]"
          >
            Talk to Sales
            <ArrowRight className="h-4 w-4 opacity-70" />
          </Link>
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

          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Proofengine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
