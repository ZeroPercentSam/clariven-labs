'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Save, Trash2 } from 'lucide-react';
import { OrderStatusBadge } from '@/components/portal/OrderStatusBadge';

type Affiliate = {
  id: string;
  name: string;
  email: string | null;
  commission_pct: number | null;
  active: boolean;
};
type Code = {
  id: string;
  code: string;
  discount_pct: number;
  active: boolean;
  expires_at: string | null;
};
type Order = {
  id: string;
  order_number: number;
  total_cents: number;
  discount_cents: number;
  status: string;
  created_at: string;
};

export function AffiliateDetail({
  affiliate,
  codes: initialCodes,
  orders,
}: {
  affiliate: Affiliate;
  codes: Code[];
  orders: Order[];
}) {
  const router = useRouter();
  const [name, setName] = useState(affiliate.name);
  const [email, setEmail] = useState(affiliate.email ?? '');
  const [commission, setCommission] = useState(
    affiliate.commission_pct != null ? String(affiliate.commission_pct) : '',
  );
  const [active, setActive] = useState(affiliate.active);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // New code form
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  const [codes, setCodes] = useState(initialCodes);

  async function saveProfile() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: affiliate.id,
          name,
          email: email || null,
          commission_pct: commission ? Number(commission) : null,
          active,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function createCode() {
    if (!newCode.trim() || !newDiscount) return;
    try {
      const res = await fetch('/api/admin/affiliate-codes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          code: newCode.trim().toUpperCase(),
          discount_pct: Number(newDiscount),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setCodes((prev) => [json.code, ...prev]);
      setNewCode('');
      setNewDiscount('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function toggleCode(c: Code) {
    try {
      const res = await fetch('/api/admin/affiliate-codes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: c.id,
          affiliate_id: affiliate.id,
          code: c.code,
          discount_pct: c.discount_pct,
          active: !c.active,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function deleteCode(id: string) {
    if (!confirm('Delete this code? Existing orders keep the discount they already had.')) return;
    try {
      const res = await fetch(`/api/admin/affiliate-codes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setCodes((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  const gross = orders.reduce((s, o) => s + o.total_cents, 0);
  const discount = orders.reduce((s, o) => s + o.discount_cents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cl-navy">{affiliate.name}</h1>
        <p className="text-cl-gray-500 text-sm">{affiliate.email ?? '—'}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Gross" value={`$${(gross / 100).toFixed(2)}`} />
        <Stat label="Discount given" value={`$${(discount / 100).toFixed(2)}`} />
      </div>

      {/* Edit profile */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-cl-navy font-semibold text-sm">Details</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} />
          <Field label="Commission %" value={commission} onChange={setCommission} />
          <label className="flex items-center gap-2 text-sm text-cl-gray-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
        </div>
        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Codes */}
      <div className="bg-white border border-cl-gray-200 rounded-xl p-5">
        <h2 className="text-cl-navy font-semibold text-sm mb-3">Codes</h2>
        <ul className="divide-y divide-cl-gray-100 mb-4">
          {codes.length === 0 ? (
            <li className="py-6 text-center text-sm text-cl-gray-500">No codes yet.</li>
          ) : (
            codes.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2">
                <span className="font-mono text-cl-navy text-sm tracking-wider">{c.code}</span>
                <span className="text-cl-gray-500 text-xs">{c.discount_pct}% off</span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => toggleCode(c)}
                  className={`px-2 py-0.5 text-xs rounded-full border ${
                    c.active
                      ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                      : 'text-cl-gray-500 border-cl-gray-300 bg-cl-gray-50'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCode(c.id)}
                  className="text-cl-gray-400 hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="NEW CODE"
            className="flex-1 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm font-mono"
          />
          <input
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            placeholder="Discount %"
            inputMode="decimal"
            className="w-32 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm"
          />
          <button
            type="button"
            onClick={createCode}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cl-navy text-white text-sm"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-cl-gray-200 text-cl-navy font-semibold text-sm">
          Referred orders
        </div>
        <ul className="divide-y divide-cl-gray-100">
          {orders.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-cl-gray-500">No orders yet.</li>
          ) : (
            orders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex-1 text-cl-navy hover:text-cl-teal font-medium text-sm"
                >
                  Order #{o.order_number}
                </Link>
                <div className="text-xs text-cl-gray-500">
                  {new Date(o.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-cl-navy w-20 text-right">
                  ${(o.total_cents / 100).toFixed(2)}
                </div>
                <OrderStatusBadge status={o.status} />
              </li>
            ))
          )}
        </ul>
      </div>

      {err ? <p className="text-xs text-red-500">{err}</p> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
      <div className="text-xs text-cl-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold text-cl-navy">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
      />
    </label>
  );
}
