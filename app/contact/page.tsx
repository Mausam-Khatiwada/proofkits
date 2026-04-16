import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Contact ProofKits sales and support for onboarding, pricing guidance, and integration questions.',
  path: '/contact',
});

const channels = [
  {
    title: 'Sales and onboarding',
    detail: 'Get rollout guidance, architecture support, and plan recommendations for your team.',
    action: 'sales@proofkit.app',
    icon: MessageSquare,
  },
  {
    title: 'Product support',
    detail: 'Questions about setup, widgets, moderation, or performance? We can help directly.',
    action: 'support@proofkit.app',
    icon: Mail,
  },
  {
    title: 'Security and compliance',
    detail: 'Need documentation for procurement and internal reviews? Contact our trust team.',
    action: 'security@proofkit.app',
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Contact navigation">
          <Link href="/" className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">
            ProofKits
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="border-[var(--app-border)] bg-[var(--landing-panel)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-muted)]" />
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
            Contact
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-[var(--landing-text)] sm:text-5xl">
            We help teams ship better social proof faster
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--landing-muted)] sm:text-lg">
            Reach out for onboarding support, deployment guidance, or security documentation. We usually reply within one business day.
          </p>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {channels.map(({ title, detail, action, icon: Icon }) => (
            <article
              key={title}
              className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_16px_42px_rgba(27,45,80,0.12)]"
            >
              <div className="mb-4 inline-flex rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-2">
                <Icon className="h-5 w-5 text-[var(--landing-accent)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--landing-text)]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">{detail}</p>
              <a href={`mailto:${action}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-accent)]">
                {action}
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_16px_40px_rgba(27,45,80,0.11)] sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">Support SLA</h2>
          <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-[var(--landing-muted)]">
            <Clock3 className="mt-1 h-4 w-4 text-cyan-500" />
            Standard response target is less than 24 business hours. Growth and Scale customers receive priority routing.
          </p>
        </section>
      </main>
    </div>
  );
}
