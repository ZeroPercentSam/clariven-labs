import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { listAllCommissions } from '@/lib/rep/commissions-admin';

// Admin CSV export of the commission ledger. Admin-gated (mirrors the page's
// requireAdmin) — returns 403 otherwise.
export async function GET() {
  if (!supabaseEnvConfigured()) {
    return new NextResponse('Service unavailable', { status: 503 });
  }
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { rows } = await listAllCommissions('all', 5000);
  const header = [
    'earned_at',
    'rep_email',
    'organization',
    'source',
    'base_cents',
    'cogs_cents',
    'rate',
    'commission_cents',
    'status',
    'paid_batch_id',
    'order_id',
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.earned_at,
        r.rep_email ?? '',
        r.org_name ?? '',
        r.source,
        r.base_cents,
        r.cogs_cents,
        r.rate,
        r.commission_cents,
        r.status,
        r.paid_batch_id ?? '',
        r.order_id,
      ]
        .map(esc)
        .join(','),
    );
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clariven-commissions.csv"',
    },
  });
}
