import { NextResponse } from 'next/server';
import { runDrips } from '@/lib/drips/run';

// Daily onboarding-drip sender. Vercel Cron invokes this with
// `Authorization: Bearer ${CRON_SECRET}` (schedule in vercel.json). Inert if
// CRON_SECRET is unset — returns 401 rather than scanning, so it never runs
// unauthenticated. Service-role work happens inside runDrips().
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const result = await runDrips();
    return NextResponse.json(result);
  } catch (e) {
    console.error('[cron/drips]', e);
    return NextResponse.json({ ok: false, error: 'drip run failed' }, { status: 500 });
  }
}
