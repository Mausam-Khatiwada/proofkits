import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { sanitizeNextPath } from '@/lib/auth/navigation';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, allow the request through without auth
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const errorCode = request.nextUrl.searchParams.get('error_code');

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
  ];

  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/collect/') ||
    pathname.startsWith('/api/embed/') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/twitter-image') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/widget.js') ||
    pathname.includes('.');

  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')) {
    const next = sanitizeNextPath(request.nextUrl.searchParams.get('next'));
    const url = request.nextUrl.clone();
    url.pathname = next;
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (
    pathname === '/' &&
    (errorCode === 'otp_expired' || errorCode === 'access_denied')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/forgot-password';
    url.search = '';
    url.searchParams.set('error', 'expired_recovery_link');
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicPath) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const next = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
