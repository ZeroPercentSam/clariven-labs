'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function AffiliateCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commission, setCommission] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          commission_pct: commission ? Number(commission) : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setOpen(false);
      setName('');
      setEmail('');
      setCommission('');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cl-navy text-white text-sm"
      >
        <Plus className="w-4 h-4" /> New affiliate
      </button>
    );
  }

  return (
    <div className="w-full bg-white border border-cl-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="flex-1 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="flex-1 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm"
      />
      <input
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        placeholder="Commission %"
        inputMode="decimal"
        className="w-32 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="px-3 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 rounded-lg text-cl-gray-500 text-sm"
        >
          Cancel
        </button>
      </div>
      {err ? <p className="text-xs text-red-500 sm:ml-2">{err}</p> : null}
    </div>
  );
}
