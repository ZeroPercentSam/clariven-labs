import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/roles';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';
import { MessageThread } from '@/components/portal/MessageThread';
import { ResendInvoiceButton } from '@/components/portal/ResendInvoiceButton';

export const dynamic = 'force-dynamic';

export default async function PortalOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getProfile();

  const [{ data: order }, { data: items }, { data: messages }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).maybeSingle(),
    supabase.from('order_items').select('*').eq('order_id', id).order('created_at'),
    supabase.from('order_messages').select('*').eq('order_id', id).order('created_at'),
  ]);

  if (!order) notFound();

  const payable = order.status === 'pending_payment' || order.status === 'processing';

  return (
    <div>
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-cl-gray-500 hover:text-cl-teal text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-cl-navy">Order #{order.order_number}</h1>
          <p className="text-cl-gray-500 text-sm mt-1">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Items */}
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cl-gray-200 text-cl-navy font-semibold text-sm">
            Items
          </div>
          <ul className="divide-y divide-cl-gray-100">
            {(items ?? []).map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-cl-navy text-sm font-medium truncate">{it.product_name}</div>
                  <div className="text-cl-gray-500 text-xs">{it.strength_label} · ×{it.quantity}</div>
                </div>
                <div className="text-sm text-cl-navy">
                  ${(it.line_total_cents / 100).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 border-t border-cl-gray-200 text-sm space-y-1">
            <Row label="Subtotal" value={`$${(order.subtotal_cents / 100).toFixed(2)}`} />
            {order.discount_cents > 0 ? (
              <Row
                label="Discount"
                value={`-$${(order.discount_cents / 100).toFixed(2)}`}
                emphasis
              />
            ) : null}
            <Row label="Total" value={`$${(order.total_cents / 100).toFixed(2)}`} bold />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <h3 className="text-cl-navy font-semibold text-sm mb-2">Shipping</h3>
            <ShippingView value={order.shipping_address as Record<string, string>} />
          </div>

          {order.tracking_number ? (
            <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
              <h3 className="text-cl-navy font-semibold text-sm mb-2">Tracking</h3>
              <p className="text-cl-gray-700 text-sm">{order.tracking_carrier ?? 'Carrier'}</p>
              <p className="text-cl-navy font-medium">{order.tracking_number}</p>
            </div>
          ) : null}

          {payable && order.gbp_invoice_id ? (
            <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
              <h3 className="text-cl-navy font-semibold text-sm mb-1 inline-flex items-center gap-2">
                <Mail className="w-4 h-4" /> Payment email
              </h3>
              <p className="text-cl-gray-500 text-xs mb-3 leading-relaxed">
                Check your inbox for a secure link from Green.Money. Didn't receive it?
              </p>
              <ResendInvoiceButton orderId={order.id} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <MessageThread
          orderId={order.id}
          initial={(messages ?? []).map((m) => ({
            id: m.id,
            author_role: m.author_role,
            body: m.body,
            created_at: m.created_at,
          }))}
          currentRole={profile?.role === 'admin' ? 'admin' : 'customer'}
        />
      </div>
    </div>
  );
}

function Row({ label, value, bold, emphasis }: { label: string; value: string; bold?: boolean; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? 'text-cl-navy font-semibold' : 'text-cl-gray-500'}`}>{label}</span>
      <span className={`${bold ? 'text-cl-navy font-semibold' : emphasis ? 'text-cl-teal' : 'text-cl-navy'}`}>
        {value}
      </span>
    </div>
  );
}

function ShippingView({ value }: { value: Record<string, string> | null }) {
  if (!value) return <p className="text-cl-gray-500 text-sm">—</p>;
  return (
    <address className="not-italic text-sm text-cl-navy leading-relaxed">
      {value.full_name ? (
        <>
          {value.full_name}
          <br />
        </>
      ) : null}
      {value.line1 ? (
        <>
          {value.line1}
          <br />
        </>
      ) : null}
      {value.line2 ? (
        <>
          {value.line2}
          <br />
        </>
      ) : null}
      {[value.city, value.state, value.postal_code].filter(Boolean).join(', ')}
      <br />
      {value.country}
    </address>
  );
}
