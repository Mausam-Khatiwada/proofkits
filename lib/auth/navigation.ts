export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = '/dashboard',
  options?: { allowResetPassword?: boolean }
): string {
  if (!next) return fallback;
  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//')) return fallback;

  const disallowedPrefixes = ['/login', '/signup', '/forgot-password', '/auth/callback'];
  if (!options?.allowResetPassword) {
    disallowedPrefixes.push('/reset-password');
  }

  if (disallowedPrefixes.some((prefix) => next.startsWith(prefix))) {
    return fallback;
  }

  return next;
}
