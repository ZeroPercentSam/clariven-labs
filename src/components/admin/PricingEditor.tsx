'use client';

import { useMemo, useState, useTransition } from 'react';
import { Save, Search, Calculator } from 'lucide-react';
import { RUO_MARKUP_MULTIPLIER, marginCents, marginPct, retailFromCogs } from '@/lib/pricing';

export type PricingRow = {
  productSlug: string;
  productName: string;
  strengthLabel: string;
  priceCents: number | null;
  cogsCents: number | null;
  active: boolean;
};

type RowState = PricingRow & { dirty: boolean; saving: boolean; error?: string };

function dollars(cents: number | null): string {
  return cents == null ? '' : (cents / 100).toFixed(2);
}

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

  const dirtyCount = rows.filter((r) => r.dirty).length;

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
          cogs_cents: row.cogsCents,
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

  async function saveAllDirty() {
    const indices = rows.map((r, i) => (r.dirty && !r.saving ? i : -1)).filter((i) => i >= 0);
    for (const idx of indices) {
      await save(idx);
    }
  }

  // Set retail = cost x 4 for one row (no-op if cost unknown).
  function recompute(idx: number) {
    const row = rows[idx];
    if (!row || row.cogsCents == null) return;
    updateRow(idx, { priceCents: retailFromCogs(row.cogsCents) });
  }

  // Set retail = cost x 4 for every row that has a cost. Stages as dirty.
  function recomputeAll() {
    setRows((prev) =>
      prev.map((r) =>
        r.cogsCents == null ? r : { ...r, priceCents: retailFromCogs(r.cogsCents), dirty: true },
      ),
    );
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-cl-gray-200 bg-cl-gray-50">
        <Search className="w-4 h-4 text-cl-gray-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by product, slug, or strength…"
          className="flex-1 min-w-[180px] bg-transparent text-sm text-cl-navy placeholder:text-cl-gray-400 outline-none"
        />
        <span className="text-xs text-cl-gray-400">{filtered.length} rows</span>
        <button
          type="button"
          onClick={recomputeAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-cl-teal/40 text-cl-teal text-xs font-medium hover:bg-cl-teal/5"
          title={`Set retail = cost × ${RUO_MARKUP_MULTIPLIER} for every row with a cost`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Recompute all at {RUO_MARKUP_MULTIPLIER}× cost
        </button>
        <button
          type="button"
          onClick={saveAllDirty}
          disabled={dirtyCount === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cl-teal text-white text-xs font-medium hover:bg-cl-teal-light disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          Save changed{dirtyCount > 0 ? ` (${dirtyCount})` : ''}
        </button>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[minmax(0,1fr)_90px_104px_104px_116px_60px_84px] items-center gap-3 px-4 py-2 border-b border-cl-gray-100 bg-white text-[11px] font-semibold uppercase tracking-wider text-cl-gray-400">
        <div>Product</div>
        <div>Strength</div>
        <div>Cost</div>
        <div>Retail</div>
        <div>Margin</div>
        <div>Active</div>
        <div></div>
      </div>

      <div className="divide-y divide-cl-gray-100">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">No matches.</p>
        ) : (
          filtered.map((row) => {
            const idx = rows.indexOf(row);
            const mCents = marginCents(row.priceCents, row.cogsCents);
            const mPct = marginPct(row.priceCents, row.cogsCents);
            return (
              <div
                key={`${row.productSlug}::${row.strengthLabel}`}
                data-sku={`${row.productSlug}::${row.strengthLabel}`}
                className="grid grid-cols-[minmax(0,1fr)_90px_104px_104px_116px_60px_84px] items-center gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-cl-navy text-sm font-medium truncate">{row.productName}</div>
                  <div className="text-cl-gray-400 text-xs truncate">{row.productSlug}</div>
                </div>
                <div className="text-cl-navy text-sm">{row.strengthLabel}</div>

                {/* Cost (admin-only) */}
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cl-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    aria-label="Cost"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={dollars(row.cogsCents)}
                    onChange={(e) => {
                      const n = Number.parseFloat(e.target.value);
                      updateRow(idx, { cogsCents: Number.isFinite(n) ? Math.round(n * 100) : null });
                    }}
                    placeholder="—"
                    className="w-full pl-5 pr-1.5 py-1.5 rounded-md border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
                  />
                </div>

                {/* Retail (+ x4 helper) */}
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cl-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    aria-label="Retail"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={dollars(row.priceCents)}
                    onChange={(e) => {
                      const n = Number.parseFloat(e.target.value);
                      updateRow(idx, { priceCents: Number.isFinite(n) ? Math.round(n * 100) : null });
                    }}
                    placeholder="—"
                    className="w-full pl-5 pr-7 py-1.5 rounded-md border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
                  />
                  <button
                    type="button"
                    onClick={() => recompute(idx)}
                    disabled={row.cogsCents == null}
                    title={`Set retail to cost × ${RUO_MARKUP_MULTIPLIER}`}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-cl-teal hover:bg-cl-teal/10 disabled:opacity-30"
                  >
                    ×{RUO_MARKUP_MULTIPLIER}
                  </button>
                </div>

                {/* Margin */}
                <div className="text-xs tabular-nums">
                  {mCents == null ? (
                    <span className="text-cl-gray-300">—</span>
                  ) : (
                    <span className={mCents >= 0 ? 'text-cl-navy' : 'text-red-500'}>
                      ${(mCents / 100).toFixed(2)}
                      {mPct != null ? (
                        <span className="text-cl-gray-400"> · {mPct.toFixed(0)}%</span>
                      ) : null}
                    </span>
                  )}
                </div>

                <label className="inline-flex items-center justify-center text-xs text-cl-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => updateRow(idx, { active: e.target.checked })}
                    className="rounded"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => save(idx)}
                  disabled={!row.dirty || row.saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cl-teal text-white text-xs font-medium hover:bg-cl-teal-light disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  {row.saving ? '…' : row.dirty ? 'Save' : 'Saved'}
                </button>
                {row.error ? (
                  <p className="col-span-7 -mt-1 text-[11px] text-red-500">{row.error}</p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
