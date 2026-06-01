import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Mock-aware rate limiting (invariant #6 shape). When UPSTASH_REDIS_REST_URL /
// _TOKEN are absent — dev, CI, and prod pre-cutover — the limiter is null and
// checkRateLimit no-ops (allow), so the happy path never 429s. When configured,
// it sliding-windows via the Upstash REST API. Limiter errors fail OPEN: a Redis
// hiccup must never block legitimate traffic.

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

let redis: Redis | null | undefined; // undefined = unresolved, null = unconfigured

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, limit: number, windowSec: number): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const key = `${name}:${limit}:${windowSec}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `cl:rl:${name}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/** Best-IP for an unauthenticated identifier. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function checkRateLimit(
  identifier: string,
  opts?: { name?: string; limit?: number; windowSec?: number },
): Promise<RateLimitResult> {
  const limiter = getLimiter(opts?.name ?? 'default', opts?.limit ?? 30, opts?.windowSec ?? 60);
  if (!limiter) return { ok: true }; // unconfigured → no-op allow
  try {
    const res = await limiter.limit(identifier);
    if (res.success) return { ok: true };
    return { ok: false, retryAfter: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)) };
  } catch (e) {
    console.warn('[ratelimit] limiter error — failing open', e);
    return { ok: true };
  }
}

/**
 * Route helper: returns a 429 NextResponse when the identifier is over the
 * limit, else null. Call at the top of a mutating handler:
 *   const limited = await rateLimit(user?.id ?? clientIp(req), { name: 'orders', limit: 5, windowSec: 60 });
 *   if (limited) return limited;
 */
export async function rateLimit(
  identifier: string,
  opts?: { name?: string; limit?: number; windowSec?: number },
): Promise<NextResponse | null> {
  const res = await checkRateLimit(identifier, opts);
  if (res.ok) return null;
  return NextResponse.json(
    { error: 'Too many requests — slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(res.retryAfter) } },
  );
}
