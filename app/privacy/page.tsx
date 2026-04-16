import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Learn how ProofKits collects, uses, and protects data.',
  path: '/privacy',
});

const sections = [
  {
    title: 'Information we collect',
    body: 'ProofKits collects account details, workspace configuration data, and testimonial content submitted through your collection forms and integrations.',
  },
  {
    title: 'How we use data',
    body: 'We use data to deliver the service, improve product quality, provide support, and generate analytics requested by your workspace.',
  },
  {
    title: 'Data controls',
    body: 'Workspace owners can edit or remove testimonial records, control publishing permissions, and request export or deletion support via our support team.',
  },
  {
    title: 'Security practices',
    body: 'We apply role-based access controls, auditing mechanisms, and infrastructure safeguards to protect customer data and testimonial assets.',
  },
  {
    title: 'Retention',
    body: 'Data is retained for the duration of your active account unless a shorter retention period is required by your policies or legal obligations.',
  },
  {
    title: 'Contact',
    body: 'For privacy requests or questions, contact privacy@proofkit.app. We review and respond as quickly as possible.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/" className="text-sm font-semibold text-[var(--landing-accent)]">
          Back to home
        </Link>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-[var(--landing-text)] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">
          Effective date: April 15, 2026. This summary explains how ProofKits handles data for service operation and customer support.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
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
