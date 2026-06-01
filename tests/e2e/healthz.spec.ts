// /api/healthz (Phase 6a). Public, anon — reports Supabase liveness + each
// integration's configured/mock/missing status. Asserts it returns 200 with a
// reachable DB, exposes the expected check keys, and leaks NO secret values.

import { expect, test } from '@playwright/test';

const INTEGRATION_STATUSES = ['configured', 'mock', 'missing'];

test('healthz returns 200, supabase ok, and leaks no secrets', async ({ request }) => {
  const res = await request.get('/api/healthz');
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(typeof body.ts).toBe('string');

  const { checks } = body;
  expect(checks.supabase).toBe('ok');
  for (const key of ['gbp', 'twilio', 'resend', 'cron']) {
    expect(checks).toHaveProperty(key);
  }
  expect(INTEGRATION_STATUSES).toContain(checks.gbp);
  expect(INTEGRATION_STATUSES).toContain(checks.twilio);
  expect(['configured', 'missing']).toContain(checks.resend);
  expect(['configured', 'missing']).toContain(checks.cron);

  // No secret-shaped VALUES leak (the `supabase` key name is fine): JWTs (eyJ…),
  // sk_ tokens, a Supabase project URL, service_role, bearer tokens.
  const raw = JSON.stringify(body);
  expect(raw).not.toMatch(/eyJ|sk_|sk-|\.supabase\.co|service_role|Bearer\s/i);
  // The Supabase anon/service keys + CRON_SECRET are long; nothing in the body
  // should be a long opaque token.
  for (const v of Object.values(checks)) {
    expect(String(v).length).toBeLessThan(20);
  }
});
