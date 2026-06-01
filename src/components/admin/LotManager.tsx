'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createLot, deleteLot, setLotActive, uploadLotCoa } from '@/lib/lots/actions';
import { LOT_EXPIRY_BADGE, LOT_EXPIRY_LABEL, lotExpiryStatus } from '@/lib/lots/constants';
import type { LotRow } from '@/lib/lots/queries';

type CatalogItem = { slug: string; name: string; strengths: string[] };

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy focus:outline-none focus:border-cl-teal/60';
const labelCls = 'block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1';

export function LotManager({ lots, catalog }: { lots: LotRow[]; catalog: CatalogItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(catalog[0]?.slug ?? '');
  // Stabilise "now" once (lazy init) so the expiry-status calc stays pure across
  // renders — avoids the impure-new-Date()-during-render lint.
  const [now] = useState(() => new Date());
  const addFormRef = useRef<HTMLFormElement>(null);

  const strengths = useMemo(
    () => catalog.find((c) => c.slug === selectedSlug)?.strengths ?? [],
    [catalog, selectedSlug],
  );
  const nameFor = (slug: string) => catalog.find((c) => c.slug === slug)?.name ?? slug;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, id: string) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok) setError(res.error ?? 'Action failed.');
      else router.refresh();
    });
  }

  function onAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createLot(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      addFormRef.current?.reset();
      setSelectedSlug(catalog[0]?.slug ?? '');
      router.refresh();
    });
  }

  function onUploadCoa(formData: FormData) {
    const lotId = String(formData.get('lot_id') ?? '');
    setError(null);
    setBusyId(lotId);
    startTransition(async () => {
      const res = await uploadLotCoa(formData);
      setBusyId(null);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Add lot */}
      <form
        ref={addFormRef}
        action={onAdd}
        className="bg-white border border-cl-gray-200 rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-3 -mb-1">
          <h2 className="text-sm font-semibold text-cl-navy">Add a lot</h2>
        </div>
        <label className="block">
          <span className={labelCls}>Product</span>
          <select
            name="product_slug"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className={inputCls}
          >
            {catalog.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Strength</span>
          <select name="strength_label" defaultValue="" className={inputCls}>
            <option value="">Product-level (all strengths)</option>
            {strengths.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Lot number</span>
          <input name="lot_number" type="text" required maxLength={120} placeholder="e.g. CLV-2406-A" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Expiration date</span>
          <input name="expiration_date" type="date" required className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Received (optional)</span>
          <input name="received_at" type="date" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>COA PDF (optional)</span>
          <input name="file" type="file" accept="application/pdf" className="text-sm text-cl-gray-600" />
        </label>
        <label className="block lg:col-span-3">
          <span className={labelCls}>Notes (optional)</span>
          <input name="notes" type="text" maxLength={500} className={inputCls} />
        </label>
        <div className="lg:col-span-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add lot
          </button>
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
      </form>

      {/* Lots table */}
      {lots.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl px-4 py-10 text-center text-sm text-cl-gray-500">
          No lots yet.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-cl-gray-500 border-b border-cl-gray-200">
                <th className="text-left font-semibold px-4 py-2.5">Product</th>
                <th className="text-left font-semibold px-4 py-2.5">Lot</th>
                <th className="text-left font-semibold px-4 py-2.5">Expiration</th>
                <th className="text-left font-semibold px-4 py-2.5">COA</th>
                <th className="text-left font-semibold px-4 py-2.5">Active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {lots.map((lot) => {
                const status = lotExpiryStatus(lot.expirationDate, now);
                const busy = busyId === lot.id && pending;
                return (
                  <tr key={lot.id} className={`hover:bg-cl-gray-50 ${lot.active ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3 align-top">
                      <p className="text-cl-navy font-medium">{nameFor(lot.productSlug)}</p>
                      {lot.strengthLabel ? (
                        <p className="text-[11px] text-cl-gray-400">{lot.strengthLabel}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs text-cl-navy">{lot.lotNumber}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs text-cl-navy">{lot.expirationDate}</span>
                      <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${LOT_EXPIRY_BADGE[status]}`}>
                        {LOT_EXPIRY_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {lot.coaPublicUrl ? (
                        <a href={lot.coaPublicUrl} target="_blank" rel="noopener noreferrer" className="text-cl-teal text-xs hover:underline">
                          View COA
                        </a>
                      ) : (
                        <span className="text-[11px] text-cl-gray-400">None</span>
                      )}
                      <form action={onUploadCoa} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="lot_id" value={lot.id} />
                        <input name="file" type="file" accept="application/pdf" required className="text-[11px] text-cl-gray-500 w-32" />
                        <button type="submit" disabled={busy} className="text-[11px] text-cl-navy hover:text-cl-teal disabled:opacity-50">
                          {lot.coaPublicUrl ? 'Replace' : 'Upload'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => setLotActive(lot.id, !lot.active), lot.id)}
                        className="text-xs text-cl-navy hover:text-cl-teal disabled:opacity-50"
                      >
                        {lot.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (confirm(`Delete lot ${lot.lotNumber}? This cannot be undone.`)) {
                            run(() => deleteLot(lot.id), lot.id);
                          }
                        }}
                        className="text-xs text-cl-gray-400 hover:text-red-500 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
