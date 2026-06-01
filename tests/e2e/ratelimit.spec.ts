// Rate limiting (Phase 6b). Without Upstash creds (dev/CI/pre-cutover) the
// limiter MUST no-op so the happy path never 429s. Real throttling is only
// exercised once UPSTASH_REDIS_REST_URL/_TOKEN land (Phase 7). Here we prove the
// no-op: the helper allows when unconfigured, and a rate-limited route never
// returns 429 under rapid fire.

import { expect, test } from '@playwright/test';
import { checkRateLimit } from '../../src/lib/ratelimit';

test('checkRateLimit no-ops (allows) when Upstash is unconfigured', async () => {
  for (let i = 0; i < 50; i++) {
    const res = await checkRateLimit('e2e-rl-identifier', { name: 'orders', limit: 1, windowSec: 60 });
    expect(res.ok).toBe(true); // would be false on the 2nd call if a real limiter were active
  }
});

test('a rate-limited admin route never 429s under rapid fire (limiter no-op)', async ({ request }) => {
  // /api/admin/orders/bulk runs rateLimit() first, then the admin gate. Unauthed
  // rapid calls should all hit the auth gate (401/403), never a 429.
  const codes: number[] = [];
  for (let i = 0; i < 12; i++) {
    const res = await request.patch('/api/admin/orders/bulk', { data: { ids: [], status: 'paid' } });
    codes.push(res.status());
  }
  expect(codes).not.toContain(429);
  // Every call reached the handler's auth gate (proves the limiter passed through).
  expect(codes.every((c) => c === 401 || c === 403)).toBe(true);
});
