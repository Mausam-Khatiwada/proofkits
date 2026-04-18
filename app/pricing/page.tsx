import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { pageMetadata } from '@/lib/seo';

const starterIncluded = [
  { text: '1 widget', highlight: '1 widget', suffix: ' with collection form' },
  { text: 'Up to 10 testimonials', highlight: '10 testimonials', suffix: ' stored' },
  { text: '3 free widget styles', highlight: '3 free widget styles', suffix: ' from gallery' },
  'Public collection page',
  { text: 'Embeddable widget', highlight: '', badge: 'with badge' },
  { text: '5 AI request messages', highlight: '5 AI request messages', suffix: ' / month' },
];

const starterNotIncluded = [
  'Remove "Powered by Proofengine" badge',
  'Premium widget styles',
  'Analytics and response tracking',
];

const proFeatures = [
  { text: 'Unlimited widgets', highlight: 'Unlimited widgets' },
  { text: 'Unlimited testimonials', highlight: 'Unlimited testimonials', suffix: ' stored' },
  { text: 'All 15 widget styles', highlight: 'All 15 widget styles', suffix: ' unlocked' },
  { text: 'Remove "Powered by" badge', highlight: 'Remove "Powered by" badge' },
  { text: 'Unlimited AI', highlight: 'Unlimited AI', suffix: ' request messages' },
  { text: 'Analytics', highlight: 'Analytics', suffix: ' — requests, opens, responses' },
  { text: 'Wall of Love', highlight: 'Wall of Love', suffix: ' page — shareable URL' },
  { text: 'Social share cards', highlight: 'Social share cards', suffix: ' — Twitter, LinkedIn' },
  'Priority email support',
];

export const metadata: Metadata = pageMetadata({
  title: 'Pricing',
  description: 'Choose the Proofengine plan that fits your team stage, from first launch to scaled social proof operations.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#08070e] dark:text-white relative min-h-screen overflow-x-hidden">
      {/* ... keeping cosmic background and header same as before if we only matched the content, wait I need to output the full new replacement range ...*/}
      {/* ── Cosmic background layers ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 bg-[#0c0c0c]" />
        <div className="stars-layer absolute inset-0" />
        <div className="absolute -top-[20%] left-[10%] h-[50rem] w-[60rem] rounded-full bg-violet-900/10 blur-[180px]" />
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
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="landing-fade-in mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <section className="grid gap-6 md:grid-cols-2">
          {/* STARTER PLAN */}
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-[#333] dark:bg-[#252525] flex flex-col">
            <div className="inline-flex max-w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Free forever
            </div>
            
            <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Starter
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600 dark:text-gray-300 min-h-[3rem]">
              Everything you need to get your first testimonials and see if it works.
            </p>

            <div className="mt-6 border-b border-slate-100 pb-6 dark:border-[#383838]">
              <div className="flex items-baseline gap-1">
                <span className="text-[2.5rem] font-bold tracking-tight text-slate-900 dark:text-white">$0</span>
                <span className="text-[0.95rem] text-slate-500 dark:text-gray-400">/ month</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">No credit card required</p>
            </div>

            <div className="mt-6 flex-grow">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                What&apos;s included
              </p>
              <ul className="mt-4 space-y-3.5">
                {starterIncluded.map((item, i) => {
                  if (typeof item === 'string') {
                    return (
                      <li key={i} className="flex items-start gap-3 text-[0.95rem] text-slate-600 dark:text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    );
                  }
                  return (
                    <li key={i} className="flex items-start gap-3 text-[0.95rem] text-slate-600 dark:text-gray-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <div>
                        {item.text.split(item.highlight).map((part, index, arr) => (
                          <span key={index}>
                            {part}
                            {index < arr.length - 1 && <strong className="font-semibold text-slate-900 dark:text-white">{item.highlight}</strong>}
                          </span>
                        ))}
                        {item.suffix}
                        {item.badge && (
                          <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-medium text-slate-600 dark:bg-[#3d3d3d] dark:text-gray-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-8 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                Not included
              </p>
              <ul className="mt-4 space-y-3.5">
                {starterNotIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[0.95rem] text-slate-500 dark:text-gray-400">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#3d3d3d]">
                      <X className="h-2.5 w-2.5 text-slate-500 dark:text-gray-400" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/signup"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50 dark:border-[#4d4d4d] dark:bg-[#333] dark:text-white dark:hover:bg-[#3d3d3d]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          {/* PRO PLAN */}
          <article className="relative flex flex-col rounded-[1.5rem] border-2 border-violet-500 bg-white shadow-xl dark:bg-[#252525]">
            <div className="absolute left-0 right-0 top-0 rounded-t-[1.3rem] bg-violet-100 py-1.5 text-center text-xs font-bold text-violet-700 dark:bg-[#e0e7ff] dark:text-[#4f46e5]">
              Most popular
            </div>
            
            <div className="flex flex-col flex-grow p-8 pt-10">
              <div className="inline-flex max-w-fit rounded-full bg-white border border-slate-200 py-1 px-3 text-xs font-semibold text-slate-700 shadow-sm dark:bg-white dark:text-[#333]">
                Pro
              </div>
              
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pro
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600 dark:text-gray-300 min-h-[3rem]">
                For freelancers and founders who are serious about turning trust into revenue.
              </p>

              <div className="mt-6 border-b border-slate-100 pb-6 dark:border-[#383838]">
                <div className="flex items-baseline gap-1">
                  <span className="text-[2.5rem] font-bold tracking-tight text-slate-900 dark:text-white">$19.99</span>
                  <span className="text-[0.95rem] text-slate-500 dark:text-gray-400">/ month</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Cancel anytime • Billed monthly</p>
              </div>

              <div className="mt-6 flex-grow">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  Everything in free, plus
                </p>
                <ul className="mt-4 space-y-3.5">
                  {proFeatures.map((item, i) => {
                    if (typeof item === 'string') {
                      return (
                        <li key={i} className="flex items-start gap-3 text-[0.95rem] text-slate-600 dark:text-gray-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={i} className="flex items-start gap-3 text-[0.95rem] text-slate-600 dark:text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <div>
                          {item.text.split(item.highlight).map((part, index, arr) => (
                            <span key={index}>
                              {part}
                              {index < arr.length - 1 && <strong className="font-semibold text-slate-900 dark:text-white">{item.highlight}</strong>}
                            </span>
                          ))}
                          {item.suffix}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black dark:bg-[#333] dark:hover:bg-[#3d3d3d]"
              >
                Upgrade to Pro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </section>

        {/* Early bird banner */}
        <div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-5 rounded-2xl bg-[#1e1e1e] border border-[#333] p-5 shadow-lg dark:bg-[#202020] dark:border-[#383838]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[#4F46E5] dark:bg-[#E0E7FF] dark:text-[#4F46E5]">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-[1.1rem]">Early bird pricing — locked in forever</h3>
            <p className="mt-0.5 text-sm text-gray-300">
              Sign up now and your $19.99/month rate is guaranteed even when prices increase.
            </p>
          </div>
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

          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Proofengine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
