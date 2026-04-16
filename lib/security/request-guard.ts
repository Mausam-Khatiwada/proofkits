import { NextResponse } from 'next/server';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function trustedOriginsFromEnv(): Set<string> {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];

  const trusted = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate) continue;
    const origin = normalizeOrigin(candidate);
    if (origin) trusted.add(origin);
  }

  return trusted;
}

export function enforceSameOriginMutation(request: Request): NextResponse | null {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const originHeader = request.headers.get('origin');
  if (!originHeader) {
    // Allow non-browser or same-site non-CORS requests.
    return null;
  }

  const requestOrigin = normalizeOrigin(originHeader);
  if (!requestOrigin) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  const trustedOrigins = trustedOriginsFromEnv();
  if (trustedOrigins.size === 0) {
    return null;
  }

  if (!trustedOrigins.has(requestOrigin)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  return null;
}

