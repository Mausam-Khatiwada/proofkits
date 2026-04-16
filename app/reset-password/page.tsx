'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  getPasswordChecks,
  getPasswordStrength,
  resetPasswordSchema,
  zodFieldErrors,
} from '@/lib/auth/validation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const hasExpiredLinkError = searchParams.get('error_code') === 'otp_expired';

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setNotice(null);

    if (!ready) {
      setServerError('Your recovery session is missing or expired. Request a new reset link.');
      return;
    }

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: result.data.password });

      if (error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('session')) {
          setServerError('Recovery session expired. Request a new reset link.');
        } else {
          setServerError('Unable to reset password right now. Please try again.');
        }
        return;
      }

      await supabase.auth.signOut();
      setNotice('Password updated successfully. Please sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        router.replace('/login?reset=success');
      }, 900);
    } catch {
      setServerError('Unable to reset password right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const strengthClass =
    passwordStrength.score <= 2
      ? 'bg-red-500'
      : passwordStrength.score <= 4
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--landing-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="font-display text-2xl font-bold">ProofKits</span>
          </Link>
          <ThemeToggle className="border-[var(--app-border)] bg-[var(--landing-panel)] text-[var(--landing-text)] hover:bg-[var(--landing-panel-muted)]" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-xl rounded-3xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel)] p-6 shadow-[0_30px_90px_rgba(30,41,59,0.15)] sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Reset
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-[var(--landing-text)]">
              Set your new password
            </h1>
            <p className="text-sm leading-6 text-[var(--landing-muted)]">
              Choose a strong password and complete your account recovery securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!ready && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-100/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-300/35 dark:bg-amber-500/14 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <span>
                    {hasExpiredLinkError
                      ? 'This recovery link has expired. Request a new one below.'
                      : 'Waiting for recovery session. Use the link from your email to continue.'}
                  </span>
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
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-[var(--landing-soft)]">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-3 py-3 pr-11 text-[var(--landing-text)] outline-none ring-violet-500/30 transition focus:ring-2"
                  placeholder="Create a new password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--landing-soft)] transition hover:text-[var(--landing-text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-[var(--landing-soft)]">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] px-3 py-3 pr-11 text-[var(--landing-text)] outline-none ring-violet-500/30 transition focus:ring-2"
                  placeholder="Confirm new password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--landing-soft)] transition hover:text-[var(--landing-text)]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[var(--landing-panel-border)] bg-[var(--landing-panel-muted)] p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--landing-soft)]">
                <span>Password strength</span>
                <span className="text-[var(--landing-text)]">{passwordStrength.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60">
                <div className={`${strengthClass} h-full transition-all`} style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-[var(--landing-soft)] sm:grid-cols-2">
                <p className={passwordChecks.length ? 'text-emerald-600 dark:text-emerald-300' : ''}>12+ characters</p>
                <p className={passwordChecks.uppercase ? 'text-emerald-600 dark:text-emerald-300' : ''}>Uppercase letter</p>
                <p className={passwordChecks.lowercase ? 'text-emerald-600 dark:text-emerald-300' : ''}>Lowercase letter</p>
                <p className={passwordChecks.number ? 'text-emerald-600 dark:text-emerald-300' : ''}>Number</p>
                <p className={passwordChecks.symbol ? 'text-emerald-600 dark:text-emerald-300' : ''}>Special character</p>
                <p className={passwordChecks.noSpaces ? 'text-emerald-600 dark:text-emerald-300' : ''}>No spaces</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update password'
              )}
            </button>
          </form>

          <div className="mt-6 text-sm text-[var(--landing-muted)]">
            {hasExpiredLinkError ? 'Get a new recovery email:' : 'Need a new recovery email?'}{' '}
            <Link href="/forgot-password" className="font-semibold text-[var(--landing-accent)]">
              Request another reset link
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
