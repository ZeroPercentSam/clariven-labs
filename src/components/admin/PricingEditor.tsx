'use client';

import { useMemo, useState, useTransition } from 'react';
import { Save, Search } from 'lucide-react';

export type PricingRow = {
  productSlug: string;
  productName: string;
  strengthLabel: string;
  priceCents: number | null;
  active: boolean;
};

type RowState = PricingRow & { dirty: boolean; saving: boolean; error?: string };

export function PricingEditor({ initialRows }: { initialRows: PricingRow[] }) {
  const [rows, setRows] = useState<RowState[]>(
    initialRows.map((r) => ({ ...r, dirty: false, saving: false })),
  );
  const [filter, setFilter] = useState('');
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.productSlug.toLowerCase().includes(q) ||
        r.strengthLabel.toLowerCase().includes(q),
    );
  }, [rows, filter]);

  function updateRow(idx: number, patch: Partial<RowState>) {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch, dirty: patch.dirty ?? true } : r)),
    );
  }

  async function save(idx: number) {
    const row = rows[idx];
    if (!row || row.saving) return;
    updateRow(idx, { saving: true, error: undefined, dirty: row.dirty });

    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product_slug: row.productSlug,
          strength_label: row.strengthLabel,
          price_cents: row.priceCents ?? 0,
          active: row.active,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(error || `HTTP ${res.status}`);
      }
      startTransition(() => {
        updateRow(idx, { dirty: false, saving: false, error: undefined });
      });
    } catch (err) {
      updateRow(idx, { saving: false, error: err instanceof Error ? err.message : 'Failed' });
    }
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cl-gray-200 bg-cl-gray-50">
        <Search className="w-4 h-4 text-cl-gray-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by product, slug, or strength…"
          className="flex-1 bg-transparent text-sm text-cl-navy placeholder:text-cl-gray-400 outline-none"
        />
        <span className="text-xs text-cl-gray-400">{filtered.length} rows</span>
      </div>

      <div className="divide-y divide-cl-gray-100">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">No matches.</p>
        ) : (
          filtered.map((row) => {
            const idx = rows.indexOf(row);
            return (
              <div
                key={`${row.productSlug}::${row.strengthLabel}`}
                className="grid grid-cols-[1fr_160px_140px_100px_auto] items-center gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-cl-navy text-sm font-medium truncate">{row.productName}</div>
                  <div className="text-cl-gray-400 text-xs truncate">{row.productSlug}</div>
                </div>
                <div className="text-cl-navy text-sm">{row.strengthLabel}</div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cl-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={row.priceCents == null ? '' : (row.priceCents / 100).toFixed(2)}
                    onChange={(e) => {
                      const n = Number.parseFloat(e.target.value);
                      updateRow(idx, {
                        priceCents: Number.isFinite(n) ? Math.round(n * 100) : null,
                      });
                    }}
                    placeholder="—"
                    className="w-full pl-6 pr-2 py-1.5 rounded-md border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-cl-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => updateRow(idx, { active: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => save(idx)}
                  disabled={!row.dirty || row.saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cl-teal text-white text-xs font-medium hover:bg-cl-teal-light disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {row.saving ? 'Saving…' : row.dirty ? 'Save' : 'Saved'}
                </button>
                {row.error ? (
                  <p className="col-span-5 -mt-1 text-[11px] text-red-500">{row.error}</p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
