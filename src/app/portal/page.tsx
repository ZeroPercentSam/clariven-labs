import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';

export const dynamic = 'force-dynamic';

export default async function PortalOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_cents, created_at, gbp_invoice_id')
    .order('created_at', { ascending: false })
    .limit(100);

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center">
        <Package className="w-10 h-10 text-cl-gray-300 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-cl-navy mb-2">No orders yet</h1>
        <p className="text-cl-gray-500 mb-6">
          When you place an order, it'll show up here. You'll also get a secure payment link by
          email.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
        >
          Browse peptides <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Your orders</h1>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li
            key={o.id}
            className="bg-white border border-cl-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-cl-teal/30 transition"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`/portal/orders/${o.id}`}
                className="text-cl-navy font-semibold hover:text-cl-teal"
              >
                Order #{o.order_number}
              </Link>
              <div className="text-cl-gray-500 text-xs mt-1">
                {new Date(o.created_at).toLocaleDateString()} &middot; ${(o.total_cents / 100).toFixed(2)}
              </div>
            </div>
            <OrderStatusBadge status={o.status} />
            <Link
              href={`/portal/orders/${o.id}`}
              className="text-cl-teal text-sm inline-flex items-center gap-1 hover:text-cl-teal-light"
            >
              View <ArrowRight className="w-4 h-4" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
