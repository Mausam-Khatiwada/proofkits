'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { forgotPasswordSchema, zodFieldErrors } from '@/lib/auth/validation';
import { absoluteUrl } from '@/lib/seo';
import { createClient } from '@/lib/supabase/client';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const hasExpiredLinkError = searchParams.get('error') === 'expired_recovery_link';

  function getRecoveryRedirectUrl() {
    const callbackPath = '/auth/callback?next=/reset-password';
    if (typeof window !== 'undefined' && window.location?.origin) {
      return new URL(callbackPath, window.location.origin).toString();
    }
    return absoluteUrl(callbackPath);
  }

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  function parseRateLimitSeconds(message: string): number {
    const secondMatch = message.match(/(\d+)\s*second/i);
    if (secondMatch?.[1]) return Number(secondMatch[1]);

    const minuteMatch = message.match(/(\d+)\s*minute/i);
    if (minuteMatch?.[1]) return Number(minuteMatch[1]) * 60;

    return 60;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setNotice(null);
    setServerError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: getRecoveryRedirectUrl(),
      });

      if (error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('rate limit') || lowered.includes('too many')) {
          const retryIn = parseRateLimitSeconds(error.message);
          setCooldownSeconds(retryIn);
          setNotice(`A reset link was requested recently. Please wait ${retryIn} seconds, then try again.`);
        } else {
          // Avoid account enumeration by returning a generic success-like response.
          setNotice('If the email exists, a secure reset link has been sent.');
        }
        return;
      }

      setNotice('If the email exists, a secure reset link has been sent.');
      setCooldownSeconds(60);
    } catch {
      setServerError('Unable to process your request right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="font-display text-2xl font-bold">ProofEngine</span>
          </Link>
          <ThemeToggle className="border-[var(--app-border)] bg-[var(--landing-panel)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-muted)]" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-xl rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_30px_90px_rgba(30,41,59,0.15)] sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Account Recovery
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-[var(--landing-text)]">
              Forgot your password?
            </h1>
            <p className="text-sm leading-6 text-[var(--landing-muted)]">
              Enter your account email and we will send a secure password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {hasExpiredLinkError && !serverError && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-100/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-300/35 dark:bg-amber-500/14 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>Your reset link has expired. Request a new secure link below.</span>
                </div>
              </div>
            )}

            {serverError && (
              <div className="rounded-xl border border-red-300/70 bg-red-100/80 px-4 py-3 text-sm text-red-900 dark:border-red-300/35 dark:bg-red-500/14 dark:text-red-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {notice && (
              <div className="rounded-xl border border-emerald-300/70 bg-emerald-100/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-300/35 dark:bg-emerald-500/14 dark:text-emerald-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <span>{notice}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-[var(--landing-soft)]">
                Account email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--landing-soft)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] py-3 pl-10 pr-3 text-[var(--landing-text)] outline-none ring-violet-500/30 transition focus:ring-2"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={loading || cooldownSeconds > 0}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cooldownSeconds > 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : cooldownSeconds > 0 ? (
                `Try again in ${cooldownSeconds}s`
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-[var(--landing-muted)]">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-[var(--landing-accent)]">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
