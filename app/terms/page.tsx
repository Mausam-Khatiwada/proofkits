import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'Terms governing your use of ProofKits.',
  path: '/terms',
});

const terms = [
  {
    title: 'Service usage',
    body: 'By using ProofKits, you agree to use the platform only for lawful business purposes and in accordance with your customer commitments.',
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
    body: 'We continuously improve ProofKits and may update features, limits, or functionality while maintaining core service commitments.',
  },
  {
    title: 'Contact',
    body: 'For contract or legal questions, contact legal@proofkit.app.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/" className="text-sm font-semibold text-[var(--landing-accent)]">
          Back to home
        </Link>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-[var(--landing-text)] sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">
          Effective date: April 15, 2026. These terms describe how ProofKits services are provided and used.
        </p>

        <div className="mt-8 space-y-4">
          {terms.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-5">
              <h2 className="text-lg font-semibold text-[var(--landing-text)]">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--landing-muted)]">{section.body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
