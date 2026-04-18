import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { ChevronDown, Star, TrendingUp, BarChart3, X, Bot, Layout, Shield, MessageSquare, Globe, Zap } from 'lucide-react';
import { PremiumTestimonialScene } from '@/components/landing/PremiumTestimonialScene';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

const siteUrl = absoluteUrl('/');

/* ── Case study cards data ── */
const caseStudies = [
  {
    company: 'Segment',
    logo: '🟢',
    person: 'Elliot Nyguen',
    role: '',
    avatar: 'EN',
    avatarGrad: 'from-green-400 to-emerald-500',
    quote:
      '"Proofengine helped us close 35% more deals bas seems by showcasing authentic social proof at key points."',
    tag: 'Conversion Boost',
    tagColor: 'text-rose-400',
    tagIcon: '+',
    revenue: '$19,700',
    revenueLabel: 'generated revenue',
  },
  {
    company: 'Gainsight',
    logo: '🔵',
    person: 'M. Fina Moma eveeeja',
    role: '',
    avatar: 'FM',
    avatarGrad: 'from-blue-400 to-indigo-500',
    quote:
      '"Our lead quality improved significantly after they started using Proofengine to highlight customer accesses stories."',
    tag: 'Enterprise Sales',
    tagColor: 'text-blue-400',
    tagIcon: '▲',
    revenue: '$45,200',
    revenueLabel: 'generated revenue',
  },
  {
    company: 'Zapier',
    logo: '⚡',
    person: 'Glorin Nygzen / Growth Lead',
    role: '',
    avatar: 'GN',
    avatarGrad: 'from-orange-400 to-amber-500',
    quote:
      '"Proofengine made it easy to gather, approve and deploy brevetial testimonials at each boosting our that be paid conversions."',
    tag: 'Trial Conversions',
    tagColor: 'text-violet-400',
    tagIcon: '×',
    revenue: '$9,450',
    revenueLabel: 'generated revenue',
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'AI Testimonials and Social Proof Platform',
  description:
    'Proofengine helps SaaS teams collect, verify, and publish customer testimonials with AI workflows, premium embeds, and conversion analytics.',
  path: '/',
});

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Proofengine',
        url: siteUrl,
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Proofengine',
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
    ],
  };

  return (
    <div className="bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#08070e] dark:text-white relative min-h-screen overflow-x-hidden">
      <Script id="proofengine-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* ── Cosmic background layers ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[#08070e]" />

        {/* Star field */}
        <div className="stars-layer absolute inset-0" />

        {/* Nebula glow top */}
        <div className="absolute -top-[20%] left-[10%] h-[50rem] w-[60rem] rounded-full bg-violet-900/20 blur-[180px]" />
        <div className="absolute -top-[10%] right-[5%] h-[40rem] w-[40rem] rounded-full bg-indigo-900/25 blur-[160px]" />
        {/* Nebula glow bottom */}
        <div className="absolute bottom-[10%] left-[30%] h-[30rem] w-[50rem] rounded-full bg-purple-900/15 blur-[150px]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HEADER / NAV
      ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-50 border-b border-slate-200 dark:border-white/[0.06]">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8" aria-label="Main">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-transform duration-300 group-hover:scale-105">
              <span className="text-sm font-bold leading-none text-white">P</span>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">Proofengine</span>
          </Link>

          {/* Center links */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#platform"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
            >
              Platform
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
            >
              Pricing
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 max-lg:hidden">
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

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <details className="group relative">
                <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200/80 bg-white/85 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-white dark:border-white/15 dark:bg-white/[0.05] dark:text-white/85 dark:hover:border-white/25 dark:hover:bg-white/[0.08] [&::-webkit-details-marker]:hidden">
                  <span className="sr-only">Toggle navigation menu</span>
                  <span className="relative h-4 w-4">
                    <span className="absolute left-1/2 top-1/2 h-[1.8px] w-4 -translate-x-1/2 -translate-y-[4px] rounded-full bg-current transition-transform duration-300 group-open:translate-y-0 group-open:rotate-45" />
                    <span className="absolute left-1/2 top-1/2 h-[1.8px] w-4 -translate-x-1/2 translate-y-[4px] rounded-full bg-current transition-transform duration-300 group-open:translate-y-0 group-open:-rotate-45" />
                  </span>
                </summary>

                <div className="absolute right-0 top-12 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#0f142f]/95 dark:shadow-[0_18px_50px_rgba(2,6,23,0.7)]">
                  <Link
                    href="#features"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    Features
                  </Link>
                  <Link
                    href="#platform"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    Platform
                  </Link>
                  <Link
                    href="/pricing"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    Pricing
                  </Link>
                  <div className="my-2 h-px bg-slate-200 dark:bg-white/[0.08]" />
                  <Link
                    href="/login"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="mt-1 block rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                  >
                    Build proof engine
                  </Link>
                </div>
              </details>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.08fr] lg:gap-2">
            {/* Left column */}
            <div className="landing-fade-in relative z-10">
              <h1 className="font-display text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[3.4rem] lg:text-[3.8rem]">
                Your testimonials
                <br />
                shouldn&apos;t sit.
                <br />
                They should sell.
              </h1>

              <p className="mt-5 max-w-md text-[0.95rem] leading-7 text-slate-600 dark:text-white/50 sm:mt-6 sm:text-lg">
                Capture &rsaquo; structure &rsaquo; deploy proof that actually
                <br className="hidden sm:block" />
                drives revenue.
              </p>

              <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.08] sm:w-auto"
                >
                  Build proof engine
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white sm:w-auto"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 dark:border-white/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-white/60" />
                  </span>
                  View plans
                </Link>
              </div>
            </div>

            {/* Right column — floating cards scene */}
            <div
              className="landing-fade-in relative min-h-[21rem] sm:min-h-[22rem] lg:-ml-6 lg:-mt-8 lg:min-h-[28rem] xl:-ml-10 xl:-mt-10"
              style={{ animationDelay: '200ms' }}
            >
              <PremiumTestimonialScene />
            </div>
          </div>
        </section>

        {/* Subtle divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════════════════
            PROOF SECTION — Case Studies
        ═══════════════════════════════════════════════════════ */}
        <section id="platform" className="landing-fade-in relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-28" style={{ animationDelay: '300ms' }}>
          <div className="mb-10 max-w-lg sm:mb-12">
            <h2 className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.12]">
              Proof that converts.
              <br />
              Not just looks good.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-white/40">
              A live proof feed captures full testimonials
              <br className="hidden sm:block" />
              and ties real revenue impact.
            </p>
          </div>

          {/* Case study cards grid */}
          <div className="grid gap-5 md:grid-cols-3">
            {caseStudies.map((study) => (
              <article
                key={study.company}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:backdrop-blur-sm dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
              >
                {/* Company header */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xl">{study.logo}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{study.company}</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${study.avatarGrad} text-[7px] font-bold text-white`}
                      >
                        {study.avatar}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-white/40">{study.person}</span>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <p className="mb-5 text-sm leading-6 text-slate-600 dark:text-white/55">{study.quote}</p>

                {/* Tag */}
                <div className="mb-4 flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${study.tagColor.replace('text-', 'text-opacity-80 dark:text-opacity-100 text-')}`}>
                    {study.tagIcon}
                  </span>
                  <span className={`text-xs font-medium ${study.tagColor}`}>{study.tag}</span>
                </div>

                {/* Revenue */}
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    <span className="mr-1 text-sm font-normal text-slate-400 dark:text-white/40">+</span>
                    {study.revenue}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-white/30">{study.revenueLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Subtle divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════════════════
            FEATURES SECTION
        ═══════════════════════════════════════════════════════ */}
        <section id="features" className="landing-fade-in relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-28">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <h2 className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.12]">
              The complete social proof engine for modern SaaS.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-slate-600 dark:text-white/50 sm:mt-5 sm:text-lg">
              Proofengine goes beyond basic review widgets. Our AI-powered testimonials platform integrates directly into your revenue loops, giving you everything needed to scale social proof without writing code.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: 'AI Testimonial Generation',
                desc: "Eliminate writer's block. Our AI assists your customers in writing compelling, high-converting testimonials based on their actual experience.",
              },
              {
                icon: Layout,
                title: 'Premium Wall of Love',
                desc: 'Embed a beautiful, responsive wall of love widget on your Next.js or React landing page in seconds. No complex iframe wrestling required.',
              },
              {
                icon: TrendingUp,
                title: 'Conversion Analytics',
                desc: 'Track exactly which testimonials drive the most signups. Connect proof directly to your MRR and optimize your SaaS sales funnel.',
              },
              {
                icon: Shield,
                title: 'Verified Auth & Trust',
                desc: 'Build absolute trust with verified customer badges. Proofengine securely authenticates identities to prevent fake reviews and boost credibility.',
              },
              {
                icon: MessageSquare,
                title: 'Automated Collection',
                desc: 'Trigger testimonial requests automatically via email when users hit key success milestones in your product.',
              },
              {
                icon: Globe,
                title: 'Global SEO Optimization',
                desc: 'Widgets are rendered securely with semantic HTML and schema.org markup to ensure your reviews rank high on Google search results.',
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04] sm:p-8">
                <div className="mb-5 inline-flex rounded-xl border border-slate-100 bg-slate-50 p-3 text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-violet-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Subtle divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════════════════
            HOW IT WORKS SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="landing-fade-in relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-28">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.12]">
                How Proofengine scales your customer trust.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-white/50">
                A seamless workflow designed for B2B and SaaS platforms to frictionlessly gather and deploy customer success stories.
              </p>

              <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
                {[
                  {
                    step: '01',
                    title: 'Automate the Ask',
                    desc: 'Connect our API to your app and trigger structured testimonial requests when users achieve success.',
                  },
                  {
                    step: '02',
                    title: 'AI Drafts the Story',
                    desc: 'Customers use our proprietary AI workflow to format their thoughts into powerful, revenue-driving copy instantly.',
                  },
                  {
                    step: '03',
                    title: 'Deploy & Analyze',
                    desc: 'Approve the review in your dashboard and seamlessly sync it to your marketing site using our high-performance React widgets.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4">
                    <span className="font-display text-xl font-bold text-violet-600 dark:text-violet-400">{item.step}</span>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-8 lg:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent dark:from-violet-500/10" />
              <div className="relative space-y-4">
                {/* Decorative workflow UI */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#0c0a1a] dark:shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center dark:bg-emerald-500/20">
                      <Star className="h-4 w-4 text-emerald-500 fill-emerald-500 dark:text-emerald-400 dark:fill-emerald-400" />
                    </div>
                    <div>
                      <div className="h-2 w-24 rounded bg-slate-200 dark:bg-white/20" />
                      <div className="mt-2 h-2 w-32 rounded bg-slate-100 dark:bg-white/10" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <div className="h-2 w-full rounded bg-slate-100 dark:bg-white/10" />
                    <div className="h-2 w-4/5 rounded bg-slate-100 dark:bg-white/10" />
                  </div>
                </div>
                <div className="flex justify-center py-2">
                  <ChevronDown className="h-6 w-6 text-violet-300 dark:text-violet-500/50" />
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10 dark:shadow-[0_0_30px_rgba(139,92,246,0.15)] dark:backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2 items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-green-400" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">Published to Landing Page</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1 text-amber-400 dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div className="mt-3 text-sm text-slate-700 dark:text-white/80 line-clamp-2">
                    &quot;This product completely changed how we handle conversion tracking. The AI drafted exactly what I wanted to say...&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subtle divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.08]" />
        </div>

        {/* ═══════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="landing-fade-in relative mx-auto max-w-4xl px-4 py-14 sm:px-8 sm:py-28">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="font-display text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-[0.95rem] text-slate-600 dark:text-white/50 sm:mt-4 sm:text-base">
              Everything you need to know about Proofengine and social proof infrastructure.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What makes Proofengine different from other testimonial platforms?',
                a: 'Proofengine is designed explicitly for modern SaaS teams. We provide an end-to-end infrastructure that not only collects text and video testimonials but utilizes AI to help customers write high-converting copy. We also provide native Next.js and React components for seamless, unbranded embedding that looks native to your site.'
              },
              {
                q: 'Are the embedded widgets SEO friendly?',
                a: 'Yes. Unlike legacy iframe solutions that hide content from search engines, our React components render semantic HTML with proper Schema.org markup. This ensures Google indexes your reviews, boosting your overall domain authority and search visibility.'
              },
              {
                q: 'Can I integrate this with my existing SaaS auth?',
                a: 'Absolutely. Proofengine offers robust APIs allowing you to pass metadata seamlessly. You can automatically attribute testimonials to verified users in your database, adding a "Verified User" trust badge to their reviews.'
              },
              {
                q: 'Is there a free tier for early startups?',
                a: 'Yes, our Starter plan is completely free and perfect for early-stage founders looking to validate their product with initial social proof. You get access to basic collection forms and display widgets.'
              }
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.02] sm:p-6 lg:p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{faq.q}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/50">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Subtle divider */}
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.08]" />
        </div>

        {/* ═══════════════════════════════════════════════════════
            BOTTOM CTA
        ═══════════════════════════════════════════════════════ */}
        <section className="landing-fade-in relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-28" style={{ animationDelay: '400ms' }}>
          <h2 className="font-display max-w-xl text-[1.9rem] font-bold tracking-[-0.03em] text-slate-900 dark:text-white/90 sm:text-[2.4rem] sm:leading-[1.14]">
            Stop collecting testimonials.
            <br />
            Start compounding revenue.
          </h2>
          <p className="mt-3 max-w-md text-[0.95rem] leading-7 text-slate-600 dark:text-white/40 sm:mt-4 sm:text-base">
            A live proof feed captures full testimonials
            <br className="hidden sm:block" />
            and ties real revenue impact.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.08] sm:w-auto"
            >
              Build your proof engine
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-center sm:px-8 md:flex-row md:items-center md:justify-between md:text-left">
          <div className="md:max-w-xs">
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Proofengine</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/35">
              Proof infrastructure for modern SaaS teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-500 dark:text-white/40 md:justify-start md:gap-5">
            <Link href="/pricing" className="transition-colors hover:text-slate-900 dark:hover:text-white/70">
              Pricing
            </Link>
            <Link href="/login" className="transition-colors hover:text-slate-900 dark:hover:text-white/70 sm:hidden">
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
