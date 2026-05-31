'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';
import { formatDateTime } from '@/lib/format-datetime';

export type AdminOrderRow = {
  id: string;
  order_number: number;
  status: string;
  total_cents: number;
  created_at: string;
};

const BULK_STATUSES = [
  'processing',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
] as const;

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;

// Client island over the server-fetched (already status/q-filtered) order rows.
// Adds three admin power tools without per-row hooks (one parent state object,
// one parent-managed mark-shipped popover) so a 200-row queue can't pile up
// hundreds of hook instances and saturate the main thread:
//   1. multi-select + bulk status change (POST /api/admin/orders/bulk)
//   2. inline mark-shipped with tracking (PATCH /api/admin/orders/[id] — reuses
//      the single-order path that fires the branded shipped email + audit row)
// The status filter + order# search stay server-side in the page's GET form, so
// an admin can still find any order, not just the 200 most recent.
export function AdminOrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [shipId, setShipId] = useState<string | null>(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders/bulk', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), status: bulkStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSelected(new Set());
      setBulkStatus('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
    } finally {
      setBusy(false);
    }
  }

  function openShip(id: string) {
    setShipId(id);
    setCarrier('');
    setTrackingNumber('');
    setError(null);
  }

  async function markShipped() {
    if (!shipId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${shipId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: 'shipped',
          tracking_carrier: carrier || null,
          tracking_number: trackingNumber || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setShipId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mark-shipped failed');
    } finally {
      setBusy(false);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-cl-gray-200 px-5 py-8 text-sm text-cl-gray-500 text-center">
        No orders match.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 ? (
        <div className="flex items-center gap-3 flex-wrap bg-cl-navy/5 border border-cl-navy/15 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-cl-navy">{selected.size} selected</span>
          <select
            aria-label="Bulk status"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-cl-gray-200 text-sm bg-white"
          >
            <option value="">Change status to…</option>
            {BULK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyBulkStatus}
            disabled={busy || !bulkStatus}
            className="text-sm px-3 py-1.5 rounded-lg bg-cl-navy text-white font-semibold disabled:opacity-50"
          >
            Apply to {selected.size}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm px-3 py-1.5 rounded-lg border border-cl-gray-200 text-cl-navy hover:bg-white"
          >
            Clear
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cl-gray-50 text-cl-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all orders"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="text-left px-3 py-2.5">Order</th>
              <th className="text-right px-3 py-2.5">Amount</th>
              <th className="text-right px-3 py-2.5">Placed</th>
              <th className="text-left px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cl-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2.5 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select order ${o.order_number}`}
                    checked={selected.has(o.id)}
                    onChange={() => toggleRow(o.id)}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-cl-navy hover:text-cl-teal font-medium"
                  >
                    Order #{o.order_number}
                  </Link>
                  {shipId === o.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 bg-cl-gray-50 border border-cl-gray-200 rounded-lg p-2">
                      <input
                        type="text"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        placeholder="Carrier (UPS, FedEx…)"
                        className="px-2 py-1 rounded border border-cl-gray-200 text-xs bg-white w-40"
                      />
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Tracking #"
                        className="px-2 py-1 rounded border border-cl-gray-200 text-xs bg-white w-44"
                      />
                      <button
                        type="button"
                        onClick={markShipped}
                        disabled={busy}
                        className="text-xs px-2.5 py-1 rounded bg-cl-teal text-white font-semibold disabled:opacity-50"
                      >
                        Mark shipped
                      </button>
                      <button
                        type="button"
                        onClick={() => setShipId(null)}
                        className="text-xs px-2.5 py-1 rounded border border-cl-gray-200 text-cl-navy"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-right text-cl-navy whitespace-nowrap">
                  {usd(o.total_cents)}
                </td>
                <td className="px-3 py-2.5 text-right text-xs text-cl-gray-500 whitespace-nowrap">
                  {formatDateTime(o.created_at)}
                </td>
                <td className="px-3 py-2.5">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  {o.status !== 'shipped' && o.status !== 'delivered' ? (
                    <button
                      type="button"
                      onClick={() => openShip(o.id)}
                      className="text-xs text-cl-teal hover:text-cl-teal/80 font-medium"
                    >
                      Ship
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
