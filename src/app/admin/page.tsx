import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, Clock, DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

const PAID_STATES = ['paid', 'preparing', 'shipped', 'delivered'];
const OUTSTANDING_STATES = ['pending_payment', 'processing'];

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function AdminHome() {
  const supabase = await createClient();
  const now = new Date();
  const sevenDaysAgoISO = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [outstandingRes, oldestPendingRes, paidThisWeekRes, ordersPastWeekRes, recentRes] =
    await Promise.all([
      supabase
        .from('orders')
        .select('total_cents, status')
        .in('status', OUTSTANDING_STATES),
      supabase
        .from('orders')
        .select('created_at')
        .eq('status', 'pending_payment')
        .order('created_at', { ascending: true })
        .limit(1),
      supabase
        .from('orders')
        .select('total_cents, gbp_paid_at, status')
        .in('status', PAID_STATES)
        .gte('gbp_paid_at', sevenDaysAgoISO),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoISO),
      supabase
        .from('orders')
        .select('id, order_number, total_cents, gbp_paid_at, user_id')
        .eq('status', 'paid')
        .order('gbp_paid_at', { ascending: false })
        .limit(8),
    ]);

  const outstandingCents = (outstandingRes.data ?? []).reduce(
    (s, o) => s + o.total_cents,
    0,
  );
  const outstandingCount = (outstandingRes.data ?? []).length;
  const oldestPendingAt = oldestPendingRes.data?.[0]?.created_at
    ? new Date(oldestPendingRes.data[0].created_at)
    : null;
  const oldestPendingAgeDays = oldestPendingAt ? daysBetween(oldestPendingAt, now) : null;
  const paidThisWeekCents = (paidThisWeekRes.data ?? []).reduce(
    (s, o) => s + o.total_cents,
    0,
  );
  const paidThisWeekCount = (paidThisWeekRes.data ?? []).length;
  const ordersPastWeek = ordersPastWeekRes.count ?? 0;

  const fmtUsd = (cents: number) =>
    `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const stats = [
    {
      label: 'Outstanding $',
      value: fmtUsd(outstandingCents),
      sub: `${outstandingCount} order${outstandingCount === 1 ? '' : 's'} awaiting payment`,
      icon: DollarSign,
      tone: 'amber',
    },
    {
      label: 'Oldest pending',
      value: oldestPendingAgeDays != null ? `${oldestPendingAgeDays}d` : '—',
      sub:
        oldestPendingAt != null
          ? `placed ${formatDate(oldestPendingAt.toISOString())}`
          : 'no pending orders',
      icon: Clock,
      tone: oldestPendingAgeDays != null && oldestPendingAgeDays >= 3 ? 'red' : 'gray',
    },
    {
      label: 'Paid this week',
      value: fmtUsd(paidThisWeekCents),
      sub: `${paidThisWeekCount} order${paidThisWeekCount === 1 ? '' : 's'}`,
      icon: TrendingUp,
      tone: 'emerald',
    },
    {
      label: 'New orders (7d)',
      value: String(ordersPastWeek),
      sub: 'placed in the last 7 days',
      icon: ShoppingBag,
      tone: 'teal',
    },
  ] as const;

  const toneCls: Record<string, string> = {
    amber: 'text-amber-700',
    red: 'text-red-700',
    emerald: 'text-emerald-700',
    teal: 'text-cl-teal',
    gray: 'text-cl-navy',
  };

  const recent = recentRes;

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, sub, icon: Icon, tone }) => (
          <div key={label} className="bg-white rounded-xl border border-cl-gray-200 p-5">
            <div className="flex items-center gap-2 text-cl-gray-500 text-[11px] uppercase tracking-[0.18em] mb-2">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <div className={`text-3xl font-semibold ${toneCls[tone] ?? toneCls.gray}`}>
              {value}
            </div>
            <div className="text-xs text-cl-gray-500 mt-1 truncate">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cl-gray-200">
          <h2 className="text-cl-navy font-semibold text-sm">Recent payments</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-cl-teal inline-flex items-center gap-1 hover:text-cl-teal-light"
          >
            All orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {(recent.data ?? []).length === 0 ? (
          <p className="px-5 py-6 text-sm text-cl-gray-500">
            No paid orders yet. Katie's SMS fires when a new order is placed; this list updates as
            invoices clear.
          </p>
        ) : (
          <ul className="divide-y divide-cl-gray-200">
            {(recent.data ?? []).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-cl-navy hover:text-cl-teal font-medium text-sm"
                >
                  Order #{o.order_number}
                </Link>
                <div className="flex items-center gap-4 text-xs text-cl-gray-500">
                  <span>${(o.total_cents / 100).toFixed(2)}</span>
                  <span>{formatDateTime(o.gbp_paid_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-8 text-xs text-cl-gray-400 inline-flex items-center gap-1">
        <Users className="w-3.5 h-3.5" /> Admin seats: sam@ovington.io, katie@puritybiolabs.com
      </p>
    </div>
  );
}
