import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * Public health endpoint. Returns ONLY status strings/booleans — never a secret,
 * env value, or PII. Integrations report `configured | mock | missing` from env
 * presence; `mock` is a valid pre-cutover prod state and does NOT fail the check.
 * Overall `ok` hinges solely on Supabase reachability. 200 when up, 503 when not.
 */
function integrationStatus(mock: boolean, configured: boolean): 'mock' | 'configured' | 'missing' {
  if (mock) return 'mock';
  return configured ? 'configured' : 'missing';
}

export async function GET() {
  // Supabase liveness via an anon-safe SECURITY DEFINER ping (no PII, no secret):
  // a reachable DB returns `false` for an unauthenticated caller with no error.
  let supabase: 'ok' | 'error' = 'error';
  try {
    const sb = await createClient();
    const { error } = await sb.rpc('is_admin');
    supabase = error ? 'error' : 'ok';
  } catch {
    supabase = 'error';
  }

  const checks = {
    supabase,
    gbp: integrationStatus(
      process.env.GBP_MOCK === 'true',
      Boolean(process.env.GBP_CLIENT_ID && process.env.GBP_API_PASSWORD),
    ),
    twilio: integrationStatus(
      process.env.TWILIO_MOCK === 'true',
      Boolean(
        process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER,
      ),
    ),
    resend: process.env.RESEND_API_KEY ? 'configured' : 'missing',
    cron: process.env.CRON_SECRET ? 'configured' : 'missing',
  } as const;

  const ok = checks.supabase === 'ok';
  return NextResponse.json({ ok, ts: new Date().toISOString(), checks }, { status: ok ? 200 : 503 });
}
