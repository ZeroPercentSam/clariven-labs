import { createClient } from '@/lib/supabase/server';
import type { RangeDays } from './sales-analytics-constants';

// Admin sales-dashboard analytics. Runs on the authenticated SSR client — the
// caller (page) requireAdmin()s and the orders RLS already admits staff via
// is_admin(), so no service-role. Aggregation is a JS reduce over a single
// bounded range query (≤90 days, .limit cap), matching the /admin overview
// metrics' approach — no SQL view/RPC needed at this volume.

// "Revenue" = orders that have reached a paid state. Mirrors the /admin overview
// "paid this week" status set.
const PAID_STATUSES = new Set(['paid', 'preparing', 'shipped', 'delivered']);

const DAY_MS = 24 * 60 * 60 * 1000;

export type SalesSummary = {
  revenueCents: number;
  paidOrders: number;
  avgOrderCents: number;
  discountCents: number;
  totalOrders: number;
};

export type DailyPoint = { date: string; revenueCents: number; orders: number };

export type SalesDashboard = {
  summary: SalesSummary;
  series: DailyPoint[];
};

// YYYY-MM-DD in America/Chicago (HQ tz) so daily buckets align with the
// timestamps rendered elsewhere (format-datetime) and a late-evening Central
// order doesn't roll into the next UTC day.
function chicagoDay(iso: string | number | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

type OrderRow = {
  status: string;
  total_cents: number;
  discount_cents: number;
  created_at: string;
};

// One query, both aggregates. Windowed by created_at (orders placed in the last
// N days); revenue counts only the rows that reached a paid state.
export async function getSalesDashboard(range: RangeDays): Promise<SalesDashboard> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - range * DAY_MS).toISOString();
  const { data } = await supabase
    .from('orders')
    .select('status, total_cents, discount_cents, created_at')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(5000);
  const rows = (data ?? []) as OrderRow[];

  let revenueCents = 0;
  let paidOrders = 0;
  let discountCents = 0;
  const byDay = new Map<string, { rev: number; n: number }>();

  for (const r of rows) {
    if (!PAID_STATUSES.has(r.status)) continue;
    revenueCents += r.total_cents;
    discountCents += r.discount_cents;
    paidOrders += 1;
    const key = chicagoDay(r.created_at);
    const cur = byDay.get(key) ?? { rev: 0, n: 0 };
    cur.rev += r.total_cents;
    cur.n += 1;
    byDay.set(key, cur);
  }

  // Continuous day buckets (oldest → newest) so the chart has no gaps.
  const series: DailyPoint[] = [];
  const now = Date.now();
  for (let i = range - 1; i >= 0; i--) {
    const key = chicagoDay(now - i * DAY_MS);
    const e = byDay.get(key) ?? { rev: 0, n: 0 };
    series.push({ date: key, revenueCents: e.rev, orders: e.n });
  }

  return {
    summary: {
      revenueCents,
      paidOrders,
      avgOrderCents: paidOrders > 0 ? Math.round(revenueCents / paidOrders) : 0,
      discountCents,
      totalOrders: rows.length,
    },
    series,
  };
}
