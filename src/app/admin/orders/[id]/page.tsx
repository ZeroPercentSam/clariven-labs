import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';
import { MessageThread } from '@/components/portal/MessageThread';
import { OrderEditor } from '@/components/admin/OrderEditor';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: messages }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).maybeSingle(),
    supabase.from('order_items').select('*').eq('order_id', id).order('created_at'),
    supabase.from('order_messages').select('*').eq('order_id', id).order('created_at'),
  ]);
  let customer: { email: string; full_name: string | null; phone: string | null } | null = null;
  if (order?.user_id) {
    const { data: cust } = await supabase
      .from('profiles')
      .select('email, full_name, phone')
      .eq('id', order.user_id)
      .maybeSingle();
    customer = cust;
  }

  if (!order) notFound();

  let affiliateName: string | null = null;
  if (order.affiliate_id) {
    const { data: aff } = await supabase
      .from('affiliates')
      .select('name')
      .eq('id', order.affiliate_id)
      .maybeSingle();
    affiliateName = aff?.name ?? null;
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-cl-gray-500 hover:text-cl-teal text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cl-navy">Order #{order.order_number}</h1>
          <p className="text-cl-gray-500 text-sm mt-1">
            Placed {new Date(order.created_at).toLocaleString()}
            {affiliateName ? <> · Referred by <span className="text-cl-teal">{affiliateName}</span></> : null}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-cl-gray-200 text-cl-navy font-semibold text-sm">
              Items
            </div>
            <ul className="divide-y divide-cl-gray-100">
              {(items ?? []).map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-cl-navy text-sm font-medium truncate">{it.product_name}</div>
                    <div className="text-cl-gray-500 text-xs">
                      {it.strength_label} · ×{it.quantity} · ${(it.unit_price_cents / 100).toFixed(2)} each
                    </div>
                  </div>
                  <div className="text-sm text-cl-navy">
                    ${(it.line_total_cents / 100).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-cl-gray-200 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-cl-gray-500">Subtotal</span>
                <span className="text-cl-navy">${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              {order.discount_cents > 0 ? (
                <div className="flex justify-between text-cl-teal">
                  <span>Discount</span>
                  <span>-${(order.discount_cents / 100).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold text-cl-navy border-t border-cl-gray-100 pt-1">
                <span>Total</span>
                <span>${(order.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <MessageThread
            orderId={order.id}
            initial={(messages ?? []).map((m) => ({
              id: m.id,
              author_role: m.author_role,
              body: m.body,
              created_at: m.created_at,
            }))}
            currentRole="admin"
          />
        </div>

        <div className="space-y-4">
          <OrderEditor
            orderId={order.id}
            initial={{
              status: order.status,
              tracking_carrier: order.tracking_carrier ?? '',
              tracking_number: order.tracking_number ?? '',
              notes_internal: order.notes_internal ?? '',
            }}
          />

          <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <h3 className="text-cl-navy font-semibold text-sm mb-2">Customer</h3>
            <p className="text-sm text-cl-navy">{customer?.full_name ?? '—'}</p>
            <p className="text-sm text-cl-gray-500">{customer?.email ?? '—'}</p>
            {customer?.phone ? (
              <p className="text-xs text-cl-gray-500">{customer.phone}</p>
            ) : null}
          </div>

          <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <h3 className="text-cl-navy font-semibold text-sm mb-2">Shipping</h3>
            <address className="not-italic text-sm text-cl-navy leading-relaxed">
              {stringifyAddress(order.shipping_address as Record<string, string>)}
            </address>
          </div>

          <div className="bg-white border border-cl-gray-200 rounded-xl p-4 text-xs text-cl-gray-500">
            <p>Green invoice: {order.gbp_invoice_id ?? '—'}</p>
            <p>Payment result: {order.gbp_payment_result ?? '—'}</p>
            <p>Last polled: {order.gbp_last_polled_at ? new Date(order.gbp_last_polled_at).toLocaleString() : '—'}</p>
            <p>Paid at: {order.gbp_paid_at ? new Date(order.gbp_paid_at).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function stringifyAddress(a: Record<string, string> | null): string {
  if (!a) return '—';
  return [a.full_name, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(', '), a.country]
    .filter(Boolean)
    .join('\n');
}
