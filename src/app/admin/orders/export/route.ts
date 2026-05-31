import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

// Admin CSV export of orders. Admin-gated (mirrors the page's middleware/role
// gate) — 403 otherwise. Honors the same ?status= and ?q= (order #) filters as
// the /admin/orders list so "export what I'm looking at" works. Lives under
// /admin/orders/export (not /api) to match the commissions + audit CSV exports;
// mutating endpoints stay under /api/admin/orders/.
export async function GET(request: NextRequest) {
  if (!supabaseEnvConfigured()) {
    return new NextResponse('Service unavailable', { status: 503 });
  }
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const sp = request.nextUrl.searchParams;
  const status = sp.get('status');
  const q = sp.get('q');

  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select(
      'order_number, status, subtotal_cents, discount_cents, total_cents, created_at, gbp_paid_at, tracking_carrier, tracking_number',
    )
    .order('created_at', { ascending: false })
    .limit(5000);
  if (status && status !== 'all') query = query.eq('status', status);
  if (q) {
    const n = Number.parseInt(q, 10);
    if (Number.isFinite(n)) query = query.eq('order_number', n);
  }
  const { data: orders } = await query;

  const header = [
    'order_number',
    'status',
    'subtotal_cents',
    'discount_cents',
    'total_cents',
    'created_at',
    'paid_at',
    'tracking_carrier',
    'tracking_number',
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const o of orders ?? []) {
    lines.push(
      [
        o.order_number,
        o.status,
        o.subtotal_cents,
        o.discount_cents,
        o.total_cents,
        o.created_at,
        o.gbp_paid_at ?? '',
        o.tracking_carrier ?? '',
        o.tracking_number ?? '',
      ]
        .map(esc)
        .join(','),
    );
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clariven-orders.csv"',
    },
  });
}
