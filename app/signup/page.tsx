'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { sanitizeNextPath } from '@/lib/auth/navigation';
import {
  getPasswordChecks,
  getPasswordStrength,
  signupSchema,
  zodFieldErrors,
} from '@/lib/auth/validation';
import { absoluteUrl } from '@/lib/seo';
import { createClient } from '@/lib/supabase/client';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');
  const callbackError = searchParams.get('error');
  const nextPath = useMemo(() => sanitizeNextPath(rawNext), [rawNext]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setVerificationNotice(null);

    const result = signupSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      acceptTerms,
      honeypot,
    });

    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    if (result.data.honeypot.trim().length > 0) {
      setVerificationNotice('Almost done. Please check your email to verify your account.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(nextPath)}`),
          data: { full_name: result.data.fullName },
        },
      });

      if (signUpError) {
        const lowered = signUpError.message.toLowerCase();
        if (lowered.includes('already registered') || lowered.includes('already exists')) {
          setServerError('This email is already registered. Please sign in instead.');
        } else if (lowered.includes('rate limit') || lowered.includes('too many')) {
          setServerError('Too many signup attempts. Please wait a moment and try again.');
        } else {
          setServerError('Unable to create account right now. Please try again.');
        }
        return;
      }

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setVerificationNotice('Account created. Check your email to verify your account before signing in.');
    } catch {
      setServerError('Unable to create account right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setErrors({});
    setServerError(null);
    setVerificationNotice(null);

    if (!acceptTerms) {
      setErrors({ acceptTerms: 'Please accept Terms and Privacy Policy to continue.' });
      return;
    }

    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(nextPath)}&flow=signup`),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const lowered = error.message.toLowerCase();
        if (lowered.includes('provider is not enabled')) {
          setServerError('Google sign-up is not enabled yet. Please enable Google provider in Supabase Auth settings.');
        } else if (lowered.includes('rate limit') || lowered.includes('too many')) {
          setServerError('Too many authentication attempts. Please wait a moment and try again.');
        } else {
          setServerError('Unable to continue with Google right now. Please try again.');
        }
      }
    } catch {
      setServerError('Unable to continue with Google right now. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  const strengthClass =
    passwordStrength.score <= 2
      ? 'bg-rose-500'
      : passwordStrength.score <= 4
        ? 'bg-amber-500'
        : 'bg-emerald-500';

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
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ProofKit</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/12 dark:text-white/80 dark:hover:border-white/20 dark:hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <main className="landing-fade-in flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#16132e]/85 dark:shadow-[0_24px_70px_rgba(88,28,135,0.35)] sm:p-8">
          <div className="mb-6 space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Production-Grade Signup
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
              Create your secure workspace
            </h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/50">
              Start collecting social proof with strong password policies, verification checks, and secure session controls.
            </p>
          </div>

          {callbackError ? (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Google sign-up was canceled or could not be completed. Please try again.</span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {serverError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {verificationNotice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{verificationNotice}</span>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                  placeholder="Alex Johnson"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'full-name-error' : undefined}
                  disabled={loading || googleLoading}
                />
                {errors.fullName && (
                  <p id="full-name-error" className="mt-1.5 text-sm text-rose-500 dark:text-rose-400">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={loading || googleLoading}
                />
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-11 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                    placeholder="Create a password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/40 dark:hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-11 text-slate-900 outline-none ring-violet-500/30 transition placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-slate-50 focus:ring-2 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/30 dark:focus:bg-black/40"
                    placeholder="Confirm password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/40 dark:hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1.5 text-sm text-rose-500 dark:text-rose-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-white/60">
                <span>Password strength</span>
                <span className="text-slate-900 dark:text-white">{passwordStrength.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`${strengthClass} h-full transition-all`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-slate-500 dark:text-white/40 sm:grid-cols-2">
                <p className={passwordChecks.length ? 'text-emerald-500 dark:text-emerald-400' : ''}>12+ characters</p>
                <p className={passwordChecks.uppercase ? 'text-emerald-500 dark:text-emerald-400' : ''}>Uppercase letter</p>
                <p className={passwordChecks.lowercase ? 'text-emerald-500 dark:text-emerald-400' : ''}>Lowercase letter</p>
                <p className={passwordChecks.number ? 'text-emerald-500 dark:text-emerald-400' : ''}>Number</p>
                <p className={passwordChecks.symbol ? 'text-emerald-500 dark:text-emerald-400' : ''}>Special character</p>
                <p className={passwordChecks.noSpaces ? 'text-emerald-500 dark:text-emerald-400' : ''}>No spaces</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="inline-flex items-start gap-2 text-sm text-slate-600 dark:text-white/60">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 bg-white hover:border-violet-500 dark:border-white/20 dark:bg-black/40 accent-violet-600 dark:accent-violet-500 dark:hover:border-violet-500/50"
                  disabled={loading || googleLoading}
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && <p className="text-sm text-rose-500 dark:text-rose-400">{errors.acceptTerms}</p>}
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/30">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
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
          </form>

          <div className="mt-8 text-sm text-slate-500 dark:text-white/50 text-center">
            Already have an account?{' '}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
