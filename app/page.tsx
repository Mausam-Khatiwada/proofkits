import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Gauge,
  Lock,
  Orbit,
  Play,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { PremiumTestimonialScene } from '@/components/landing/PremiumTestimonialScene';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

const siteUrl = absoluteUrl('/');

const metrics = [
  { value: '2,000+', label: 'SaaS teams actively collecting customer proof with ProofKits' },
  { value: '38%', label: 'Average conversion lift after adding testimonial blocks to high-intent pages' },
  { value: '10 min', label: 'Median time to launch first branded testimonial widget' },
];

const integrations = [
  'HubSpot',
  'Salesforce',
  'Notion',
  'Slack',
  'Zapier',
  'Webflow',
  'Framer',
  'WordPress',
  'Segment',
  'Pipedrive',
];

const workflow = [
  {
    step: '01',
    title: 'Capture responses in context',
    description:
      'Send branded request links from lifecycle moments such as onboarding milestones, renewals, or support wins.',
  },
  {
    step: '02',
    title: 'Enrich with AI editing layers',
    description:
      'Polish clarity, remove noise, and produce approved snippets while preserving voice and factual accuracy.',
  },
  {
    step: '03',
    title: 'Verify and route approvals',
    description:
      'Move every submission through role-based review states and permission checks before it reaches production.',
  },
  {
    step: '04',
    title: 'Deploy where trust matters',
    description:
      'Ship embeddable cards, walls, and proof strips to landing pages, pricing pages, docs, and in-app moments.',
  },
];

const operatingLayers = [
  {
    title: 'Proof Pipeline',
    description:
      'A single workflow to collect, organize, and activate customer validation across every funnel stage.',
    points: ['Multi-format capture', 'Permission tracking', 'Duplicate suppression'],
  },
  {
    title: 'Publishing Surface',
    description:
      'High-performance blocks that load fast, match your brand, and adapt to page intent by segment or campaign.',
    points: ['Visual editor', 'Style tokens', 'Context-aware layouts'],
  },
  {
    title: 'Revenue Intelligence',
    description:
      'Connect testimonial exposure to pipeline and conversion outcomes so social proof becomes measurable.',
    points: ['Attribution tags', 'Engagement analytics', 'Lift reporting'],
  },
];

const comparisonRows = [
  {
    label: 'Publishing speed',
    proofkit: 'Minutes with reusable templates and automations',
    traditional: 'Days of copy and design handoff cycles',
  },
  {
    label: 'Proof quality',
    proofkit: 'AI-assisted polishing with approval gates',
    traditional: 'Inconsistent quality and manual editing overhead',
  },
  {
    label: 'Brand consistency',
    proofkit: 'Token-based visual controls and shared presets',
    traditional: 'One-off components with visual drift',
  },
  {
    label: 'Business visibility',
    proofkit: 'Conversion and engagement impact dashboards',
    traditional: 'No clear attribution to revenue outcomes',
  },
];

const trustBlocks = [
  {
    title: 'Governance-first publishing',
    description:
      'Run testimonial approvals with clear ownership, audit trails, and permission states for every quote.',
  },
  {
    title: 'Team-safe collaboration',
    description:
      'Marketing, CS, and sales can work in one workspace without stepping on each other or losing context.',
  },
  {
    title: 'Performance-grade delivery',
    description: 'Serve proof widgets with lightweight payloads optimized for speed, responsiveness, and SEO.',
  },
];

const faqs = [
  {
    q: 'How fast can we launch ProofKits in production?',
    a: 'Most teams publish their first testimonial block in under 10 minutes and iterate from there.',
  },
  {
    q: 'Can we control styling for light and dark mode?',
    a: 'Yes. ProofKits supports tokenized styling controls and consistent rendering in both light and dark themes.',
  },
  {
    q: 'Do you support approvals and legal permissions?',
    a: 'Yes. Every testimonial can move through review stages with clear publishing permissions and history.',
  },
  {
    q: 'What happens after we launch?',
    a: 'You can track interaction and conversion lift, then optimize placements and formats based on real data.',
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'AI Testimonials and Social Proof Platform',
  description:
    'ProofKits helps SaaS teams collect, verify, and publish customer testimonials with AI workflows, premium embeds, and conversion analytics.',
  path: '/',
});

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-4 inline-flex rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[var(--landing-text)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--landing-muted)] sm:text-lg">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'ProofKits',
        url: siteUrl,
      },
      {
        '@type': 'SoftwareApplication',
        name: 'ProofKits',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '2000',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--landing-text)] selection:bg-cyan-300/40 selection:text-slate-900 dark:selection:text-slate-950">
      <Script id="proofkit-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-14%] top-[-22%] h-[40rem] w-[40rem] rounded-full bg-sky-400/22 blur-[160px] dark:bg-sky-500/20" />
        <div className="absolute right-[-14%] top-[-18%] h-[38rem] w-[38rem] rounded-full bg-indigo-500/20 blur-[150px] dark:bg-indigo-500/24" />
        <div className="absolute -bottom-44 left-[22%] h-[34rem] w-[34rem] rounded-full bg-emerald-400/14 blur-[145px] dark:bg-emerald-500/16" />
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_72%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.14),transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(80,98,132,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(80,98,132,0.07)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.78),transparent)] dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] dark:[mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.26),transparent)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main">
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-[0_0_30px_rgba(91,61,245,0.45)] transition-transform duration-300 group-hover:scale-105">
                <span className="font-display text-lg font-bold leading-none text-white">P</span>
              </div>
              <span className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">ProofKits</span>
            </Link>
            <div className="hidden items-center gap-7 lg:flex">
              <Link href="#workflow" className="text-sm font-semibold text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)]">
                Workflow
              </Link>
              <Link href="#platform" className="text-sm font-semibold text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)]">
                Platform
              </Link>
              <Link href="#results" className="text-sm font-semibold text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)]">
                Results
              </Link>
              <Link href="/pricing" className="text-sm font-semibold text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)]">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle className="border-[var(--app-border)] bg-[var(--landing-panel)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-muted)]" />
            <Link href="/login" className="hidden text-sm font-semibold text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)] sm:block">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(91,61,245,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(14,165,233,0.35)] sm:px-5 sm:py-2.5"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="landing-section-reveal relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pt-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.95)]" />
                Built for high-growth SaaS teams
              </p>

              <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-[var(--landing-text)] sm:text-5xl lg:text-7xl lg:leading-[1.01]">
                Turn customer stories into a measurable revenue system.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--landing-muted)] sm:text-lg lg:text-xl">
                ProofKits helps product, marketing, and revenue teams capture better testimonials, enrich them with AI,
                and deploy conversion-ready proof exactly where trust determines buying decisions.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-[0_24px_65px_rgba(91,61,245,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(14,165,233,0.34)] sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] px-8 py-4 text-base font-semibold text-[var(--landing-text)] shadow-[0_14px_40px_rgba(32,55,96,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--landing-panel-muted)] sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  View Plans
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-100/80 px-3 py-1.5 text-emerald-800 dark:bg-emerald-400/12 dark:text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-100/80 px-3 py-1.5 text-violet-800 dark:bg-violet-400/12 dark:text-violet-200">
                  <Sparkles className="h-4 w-4" />
                  AI-enhanced testimonial polishing
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3">
                {metrics.map((metric, index) => (
                  <article
                    key={metric.label}
                    className="landing-card-float rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-5 shadow-[0_20px_48px_rgba(27,45,80,0.13)]"
                    style={{ animationDelay: `${index * 0.9}s` }}
                  >
                    <p className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">{metric.label}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="landing-section-reveal" style={{ animationDelay: '160ms' }}>
              <PremiumTestimonialScene />
            </div>
          </div>
        </section>

        <section className="landing-section-reveal relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16" style={{ animationDelay: '240ms' }}>
          <div className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_22px_58px_rgba(33,53,91,0.15)] sm:p-8">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--landing-soft)]">
              Integrates into your existing GTM stack
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {integrations.map((name) => (
                <div
                  key={name}
                  className="landing-card-glow rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-3 py-2 text-center text-sm font-semibold text-[var(--landing-muted)]"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section-reveal mx-auto max-w-7xl border-t border-[var(--landing-panel-border)] px-4 py-16 sm:px-6 lg:py-20" style={{ animationDelay: '320ms' }}>
          <SectionHeading
            eyebrow="Workflow"
            title="Design social proof like a revenue workflow, not a static website task"
            description="Every step in ProofKits is built to reduce manual friction while raising content quality and publish confidence."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (
              <article
                key={item.step}
                className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_16px_40px_rgba(27,45,80,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(27,45,80,0.16)]"
              >
                <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
                  Step {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--landing-text)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="platform" className="landing-section-reveal mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-18" style={{ animationDelay: '400ms' }}>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-7 shadow-[0_20px_48px_rgba(27,45,80,0.13)] sm:p-8">
              <SectionHeading
                eyebrow="Platform"
                title="One platform for proof operations across teams"
                description="From collection through publish and measurement, ProofKits gives every GTM function one shared system of record."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
                    <Workflow className="h-4 w-4 text-violet-500" />
                    Pipeline automation
                  </p>
                  <p className="text-sm text-[var(--landing-muted)]">Automate requests, approval handoffs, and publishing flows.</p>
                </div>
                <div className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
                    <BarChart3 className="h-4 w-4 text-cyan-500" />
                    Conversion analytics
                  </p>
                  <p className="text-sm text-[var(--landing-muted)]">Track proof exposure, interactions, and impact by page.</p>
                </div>
                <div className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
                    <Cpu className="h-4 w-4 text-fuchsia-500" />
                    AI quality layer
                  </p>
                  <p className="text-sm text-[var(--landing-muted)]">Generate clean variants while preserving original meaning.</p>
                </div>
                <div className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
                    <Gauge className="h-4 w-4 text-emerald-500" />
                    Fast web performance
                  </p>
                  <p className="text-sm text-[var(--landing-muted)]">High quality animations without sacrificing page speed.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {operatingLayers.map((layer, index) => (
                <article
                  key={layer.title}
                  className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_16px_40px_rgba(27,45,80,0.12)]"
                  style={{ transform: `translateY(${index * 4}px)` }}
                >
                  <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">
                    {layer.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">{layer.description}</p>
                  <ul className="mt-4 space-y-2">
                    {layer.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-[var(--landing-muted)]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="landing-section-reveal mx-auto max-w-7xl border-t border-[var(--landing-panel-border)] px-4 py-16 sm:px-6 lg:py-20" style={{ animationDelay: '480ms' }}>
          <SectionHeading
            eyebrow="Outcomes"
            title="ProofKits turns testimonial management into a repeatable growth lever"
            description="Compare a production-grade proof system with traditional manual testimonial workflows."
          />

          <div className="overflow-hidden rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] shadow-[0_20px_50px_rgba(27,45,80,0.14)]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-5 py-4 text-sm font-semibold text-[var(--landing-text)] sm:px-8">
              <p>Capability</p>
              <p>ProofKits</p>
              <p>Traditional setup</p>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-[var(--landing-panel-border)] px-5 py-4 text-sm leading-6 text-[var(--landing-muted)] last:border-b-0 sm:px-8"
              >
                <p className="font-semibold text-[var(--landing-text)]">{row.label}</p>
                <p>{row.proofkit}</p>
                <p>{row.traditional}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section-reveal mx-auto max-w-7xl px-4 pb-14 sm:px-6" style={{ animationDelay: '560ms' }}>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-7 shadow-[0_20px_48px_rgba(27,45,80,0.13)] sm:p-8">
              <SectionHeading
                eyebrow="Trust"
                title="Enterprise-ready controls from day one"
                description="ProofKits keeps your proof pipeline secure, auditable, and team-friendly while still moving fast."
              />

              <div className="space-y-4">
                {trustBlocks.map((block) => (
                  <div key={block.title} className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
                    <p className="font-semibold text-[var(--landing-text)]">{block.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--landing-muted)]">{block.description}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-violet-400/40 bg-gradient-to-br from-violet-500/20 via-indigo-500/14 to-cyan-500/20 p-7 shadow-[0_20px_55px_rgba(73,52,190,0.24)] sm:p-8">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/35 bg-violet-500/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100">
                <Orbit className="h-3.5 w-3.5" />
                Team Story
              </p>
              <h3 className="font-display text-3xl font-bold tracking-[-0.03em] text-white">Built for teams that care about both polish and proof integrity.</h3>
              <p className="mt-4 text-sm leading-7 text-white/85">
                ProofKits blends conversion-focused design with approval-safe workflows so every customer voice can be
                trusted by marketing, legal, and revenue teams.
              </p>

              <div className="mt-6 rounded-2xl border border-white/20 bg-slate-950/30 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <Lock className="h-4 w-4" />
                  Security and governance baseline
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-100/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Role-based access and approval ownership
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Verification status and publishing history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Fast embeds optimized for real production traffic
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </section>

        <section id="faq" className="landing-section-reveal mx-auto max-w-7xl border-t border-[var(--landing-panel-border)] px-4 py-16 sm:px-6" style={{ animationDelay: '620ms' }}>
          <SectionHeading
            eyebrow="FAQ"
            title="Answers before you roll out"
            description="Everything teams ask before making social proof a core part of growth operations."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-2xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-5 shadow-[0_14px_36px_rgba(27,45,80,0.11)]"
              >
                <h3 className="text-base font-semibold text-[var(--landing-text)]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--landing-muted)]">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section-reveal mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20" style={{ animationDelay: '700ms' }}>
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/45 bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-500 p-8 shadow-[0_24px_60px_rgba(48,52,162,0.45)] sm:p-10">
            <div className="pointer-events-none absolute -left-16 top-0 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Launch in one session</p>
            <h2 className="relative mt-3 max-w-3xl font-display text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
              Set up your first testimonial pipeline and publish a branded proof block today.
            </h2>
            <p className="relative mt-4 max-w-2xl text-base leading-7 text-cyan-50/95">
              Bring your team, define your approval flow, and turn social proof into a system that compounds with every customer win.
            </p>
            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--landing-panel-border)] bg-[var(--landing-panel)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--landing-text)]">ProofKits</p>
            <p className="mt-2 text-sm text-[var(--landing-muted)]">Proof infrastructure for modern SaaS teams.</p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-medium text-[var(--landing-muted)]">
            <Link href="/pricing" className="transition-colors hover:text-[var(--landing-accent)]">
              Pricing
            </Link>
            <Link href="/contact" className="transition-colors hover:text-[var(--landing-accent)]">
              Contact
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[var(--landing-accent)]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--landing-accent)]">
              Terms
            </Link>
          </div>

          <p className="text-sm text-[var(--landing-muted)]">(c) {new Date().getFullYear()} ProofKits. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
