import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, DollarSign, Package, Tag, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const supabase = await createClient();

  // Parallel stats
  const [pending, processing, paid, recent] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending_payment'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase
      .from('orders')
      .select('id, order_number, total_cents, gbp_paid_at, user_id')
      .eq('status', 'paid')
      .order('gbp_paid_at', { ascending: false })
      .limit(8),
  ]);

  const stats = [
    { label: 'Pending payment', value: pending.count ?? 0, icon: Tag },
    { label: 'Processing', value: processing.count ?? 0, icon: Package },
    { label: 'Paid', value: paid.count ?? 0, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Overview</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-cl-gray-200 p-5">
            <div className="flex items-center gap-2 text-cl-gray-500 text-xs uppercase tracking-wider mb-2">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <div className="text-3xl font-semibold text-cl-navy">{value}</div>
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
                  <span>{o.gbp_paid_at ? new Date(o.gbp_paid_at).toLocaleString() : '—'}</span>
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
