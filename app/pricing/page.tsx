import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
  description: 'Choose the ProofKits plan that fits your team stage, from first launch to scaled social proof operations.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Pricing navigation">
          <Link href="/" className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">
            ProofKits
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="border-[var(--app-border)] bg-[var(--landing-panel)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-muted)]" />
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(91,61,245,0.34)]"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
            Pricing
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-[var(--landing-text)] sm:text-5xl">
            Plans designed for every proof maturity stage
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--landing-muted)] sm:text-lg">
            Start free, validate impact quickly, then scale with governance, analytics, and team collaboration.
          </p>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-[0_18px_44px_rgba(27,45,80,0.12)] ${
                plan.highlighted
                  ? 'border-violet-400/50 bg-gradient-to-br from-violet-500/14 via-fuchsia-500/10 to-cyan-500/16'
                  : 'border-[var(--landing-panel-border)] bg-[var(--landing-panel)]'
              }`}
            >
              <p className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">{plan.name}</p>
              <p className="mt-2 text-4xl font-black tracking-[-0.03em] text-[var(--landing-text)]">
                {plan.price}
                <span className="ml-1 text-base font-medium text-[var(--landing-soft)]">/month</span>
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">{plan.note}</p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[var(--landing-muted)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--landing-panel)] px-4 py-2 text-sm font-semibold text-[var(--landing-text)] ring-1 ring-[var(--landing-panel-border)] transition hover:bg-[var(--landing-panel-muted)]"
              >
                Choose {plan.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_16px_40px_rgba(27,45,80,0.11)] sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">Need an annual plan or enterprise setup?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--landing-muted)]">
            We support annual contracts, onboarding sessions, and custom governance requirements for larger teams.
            Reach out to tailor ProofKits to your stack and rollout plan.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(91,61,245,0.35)]"
          >
            Talk to Sales
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
