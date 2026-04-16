export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sanitizeNextPath } from '@/lib/auth/navigation';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const flow = searchParams.get('flow') === 'signup' ? 'signup' : 'login';
  const next = sanitizeNextPath(searchParams.get('next'), '/dashboard', {
    allowResetPassword: true,
  });
  const authPage = flow === 'signup' ? '/signup' : '/login';

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    return NextResponse.redirect(`${origin}${authPage}?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}${authPage}?error=auth_callback_failed`);
}
