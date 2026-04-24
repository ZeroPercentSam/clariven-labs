'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

type Init = {
  status: string;
  tracking_carrier: string;
  tracking_number: string;
  notes_internal: string;
};

const STATUSES = [
  'pending_payment',
  'processing',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
] as const;

export function OrderEditor({ orderId, initial }: { orderId: string; initial: Init }) {
  const router = useRouter();
  const [state, setState] = useState<Init>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: state.status,
          tracking_carrier: state.tracking_carrier || null,
          tracking_number: state.tracking_number || null,
          notes_internal: state.notes_internal || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="text-cl-navy font-semibold text-sm">Edit order</h3>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Status
        </span>
        <select
          value={state.status}
          onChange={(e) => setState({ ...state, status: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Tracking carrier
        </span>
        <input
          type="text"
          value={state.tracking_carrier}
          onChange={(e) => setState({ ...state, tracking_carrier: e.target.value })}
          placeholder="UPS, FedEx, USPS…"
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
        />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Tracking number
        </span>
        <input
          type="text"
          value={state.tracking_number}
          onChange={(e) => setState({ ...state, tracking_number: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
        />
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Internal notes (admin only)
        </span>
        <textarea
          rows={3}
          value={state.notes_internal}
          onChange={(e) => setState({ ...state, notes_internal: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
        />
      </label>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
