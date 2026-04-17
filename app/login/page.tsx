'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, Mail, ShieldCheck, ChevronDown, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { sanitizeNextPath } from '@/lib/auth/navigation';
import { loginSchema, zodFieldErrors } from '@/lib/auth/validation';
import { absoluteUrl } from '@/lib/seo';
import { createClient } from '@/lib/supabase/client';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const LOCKOUT_STORAGE_KEY = 'proofengine.auth.login.lockout_until';
const FAILED_ATTEMPTS_STORAGE_KEY = 'proofengine.auth.login.failed_attempts';

function readStoredNumber(key: string) {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function setStoredNumber(key: string, value: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(value));
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');
  const callbackError = searchParams.get('error');

  const nextPath = useMemo(() => sanitizeNextPath(rawNext), [rawNext]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const isLocked = lockoutUntil > now;
  const remainingSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));

  useEffect(() => {
    setFailedAttempts(readStoredNumber(FAILED_ATTEMPTS_STORAGE_KEY));
    setLockoutUntil(readStoredNumber(LOCKOUT_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (!callbackError) return;
    setFormError('Unable to verify your sign-in link. Please request a new one.');
  }, [callbackError]);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setMagicLinkSent(false);
      setFormError(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLocked) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isLocked]);

  useEffect(() => {
    if (lockoutUntil <= 0) return;
    if (lockoutUntil <= now) {
      resetFailureState();
    }
  }, [lockoutUntil, now]);

  function resetFailureState() {
    setFailedAttempts(0);
    setLockoutUntil(0);
    setStoredNumber(FAILED_ATTEMPTS_STORAGE_KEY, 0);
    setStoredNumber(LOCKOUT_STORAGE_KEY, 0);
  }

  function registerFailure() {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setStoredNumber(FAILED_ATTEMPTS_STORAGE_KEY, nextAttempts);

    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS;
      setLockoutUntil(until);
      setStoredNumber(LOCKOUT_STORAGE_KEY, until);
      setFailedAttempts(0);
      setStoredNumber(FAILED_ATTEMPTS_STORAGE_KEY, 0);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setMagicLinkSent(false);

    if (isLocked) {
      setFormError(`Too many attempts. Please wait ${remainingSeconds}s and try again.`);
      return;
    }

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (signInError) {
        const lowered = signInError.message.toLowerCase();
        if (lowered.includes('email not confirmed')) {
          setFormError('Please verify your email address before signing in.');
        } else {
          setFormError('Invalid email or password. Please try again.');
        }
        registerFailure();
        return;
      }

      resetFailureState();
      router.replace(nextPath);
      router.refresh();
    } catch {
      setFormError('We could not sign you in right now. Please try again.');
      registerFailure();
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setErrors({});
    setFormError(null);
    setMagicLinkSent(false);

    if (isLocked) {
      setFormError(`Too many attempts. Please wait ${remainingSeconds}s and try again.`);
      return;
    }

    const emailResult = loginSchema.shape.email.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.issues[0]?.message ?? 'Please enter a valid email address' });
      return;
    }

    setMagicLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailResult.data,
        options: {
          emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(nextPath)}`),
        },
      });

      if (error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('rate limit') || lowered.includes('too many')) {
          setFormError('Too many requests. Please wait a moment before trying again.');
        } else {
          setFormError('Unable to send magic link right now. Please try again.');
        }
        return;
      }

      setMagicLinkSent(true);
    } catch {
      setFormError('Unable to send magic link right now. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrors({});
    setFormError(null);
    setMagicLinkSent(false);

    if (isLocked) {
      setFormError(`Too many attempts. Please wait ${remainingSeconds}s and try again.`);
      return;
    }

    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(nextPath)}&flow=login`),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('provider is not enabled')) {
          setFormError('Google sign-in is not enabled yet. Please enable Google provider in Supabase Auth settings.');
        } else if (lowered.includes('rate limit') || lowered.includes('too many')) {
          setFormError('Too many requests. Please wait a moment before trying again.');
        } else {
          setFormError('Unable to continue with Google right now. Please try again.');
        }
      }
    } catch {
      setFormError('Unable to continue with Google right now. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#08070e] dark:text-white relative min-h-screen overflow-x-hidden flex flex-col">
      {/* ── Cosmic background layers ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 bg-[#08070e]" />
        <div className="stars-layer absolute inset-0" />
        <div className="absolute -top-[20%] left-[10%] h-[50rem] w-[60rem] rounded-full bg-violet-900/20 blur-[180px]" />
        <div className="absolute -bottom-[10%] right-[5%] h-[40rem] w-[40rem] rounded-full bg-indigo-900/25 blur-[160px]" />
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
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ProofEngine</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-50 dark:border-white/12 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="landing-fade-in flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#16132e]/85 dark:shadow-[0_24px_70px_rgba(88,28,135,0.35)] sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Sign In
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/50">
              Access your workspace with strong session controls and secure authentication.
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4" noValidate>
            {(formError || isLocked) && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError ?? `Too many attempts. Try again in ${remainingSeconds}s.`}</span>
                </div>
              </div>
            )}

            {magicLinkSent && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Magic link sent. Check your inbox for a secure sign-in link.
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={loading || magicLoading || googleLoading}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-rose-500 dark:text-rose-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-11 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={loading || magicLoading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/40 dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-rose-500 dark:text-rose-400">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || magicLoading || googleLoading || isLocked}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in with password'
                )}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading || magicLoading || googleLoading || isLocked}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {magicLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send magic sign-in link'
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || magicLoading || googleLoading || isLocked}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Google...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.3 12 2.3A9.7 9.7 0 0 0 2.3 12 9.7 9.7 0 0 0 12 21.7c5.6 0 9.3-3.9 9.3-9.3 0-.6-.1-1-.2-1.5H12z" />
                      <path fill="#34A853" d="M2.3 7.2l3.2 2.3A6 6 0 0 1 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.3 12 2.3A9.7 9.7 0 0 0 2.3 7.2z" />
                      <path fill="#FBBC05" d="M12 21.7c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.6-1.9 1.1-3.4 1.1a6 6 0 0 1-5.7-4l-3.2 2.5a9.7 9.7 0 0 0 9 5.2z" />
                      <path fill="#4285F4" d="M21.3 12.4c0-.6-.1-1-.2-1.5H12v3.9h5.5a4.8 4.8 0 0 1-2 2.9l3 2.4c1.8-1.7 2.8-4.1 2.8-7.7z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4 text-sm text-slate-500 dark:text-white/50 text-center">
            <p>
              Forgot your password?{' '}
              <Link href="/forgot-password" className="font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200 transition-colors">
                Reset it securely
              </Link>
            </p>
            <p>
              New to ProofEngine?{' '}
              <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200 transition-colors">
                Create an account
              </Link>
            </p>
            {searchParams.get('reset') === 'success' ? (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                Password updated successfully. Please sign in with your new password.
              </p>
            ) : null}
            <p className="text-[11px] text-slate-400 dark:text-white/30 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
              We protect authentication flows with secure session cookies and strict redirect validation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
