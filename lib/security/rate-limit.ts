import { NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

function toRateLimitHeaders(limit: number, remaining: number, resetAt: number) {
  const resetInSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));

  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetInSeconds),
  };
}

export function enforceRateLimit({
  request,
  scope,
  limit,
  windowMs,
  keyExtras = [],
}: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
  keyExtras?: Array<string | number>;
}): Promise<NextResponse | null> {
  if (upstashUrl && upstashToken) {
    return enforceUpstashRateLimit({ request, scope, limit, windowMs, keyExtras });
  }

  return Promise.resolve(enforceInMemoryRateLimit({ request, scope, limit, windowMs, keyExtras }));
}

function enforceInMemoryRateLimit({
  request,
  scope,
  limit,
  windowMs,
  keyExtras = [],
}: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
  keyExtras?: Array<string | number>;
}): NextResponse | null {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = [scope, ip, ...keyExtras].join(':');
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          ...toRateLimitHeaders(limit, 0, existing.resetAt),
          'Retry-After': String(Math.max(1, Math.ceil((existing.resetAt - now) / 1000))),
        },
      }
    );
  }

  existing.count += 1;
  buckets.set(key, existing);
  return null;
}

async function enforceUpstashRateLimit({
  request,
  scope,
  limit,
  windowMs,
  keyExtras = [],
}: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
  keyExtras?: Array<string | number>;
}): Promise<NextResponse | null> {
  if (!upstashUrl || !upstashToken) {
    return enforceInMemoryRateLimit({ request, scope, limit, windowMs, keyExtras });
  }

  const now = Date.now();
  const ip = getClientIp(request);
  const key = [scope, ip, ...keyExtras].join(':');
  const redisKey = `ratelimit:${key}`;
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['PTTL', redisKey],
        ['EXPIRE', redisKey, String(windowSeconds), 'NX'],
      ]),
      cache: 'no-store',
    });

    if (!res.ok) {
      return enforceInMemoryRateLimit({ request, scope, limit, windowMs, keyExtras });
    }

    const data = (await res.json()) as Array<{ result?: number | string | null }>;
    const count = Number(data[0]?.result ?? 0);
    let ttlMs = Number(data[1]?.result ?? -1);
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      ttlMs = windowMs;
    }
    const resetAt = now + ttlMs;

    if (count > limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            ...toRateLimitHeaders(limit, 0, resetAt),
            'Retry-After': String(Math.max(1, Math.ceil((resetAt - now) / 1000))),
          },
        }
      );
    }

    return null;
  } catch {
    return enforceInMemoryRateLimit({ request, scope, limit, windowMs, keyExtras });
  }
}
