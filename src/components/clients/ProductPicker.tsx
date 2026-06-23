'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { submitOrderRequest, type OrderRequestState } from '@/lib/orders/actions';
import { prettifyProductName } from '@/lib/orders/constants';
import type { ProductOption } from '@/lib/orders/queries';

type Props = { options: ProductOption[]; kind: 'initial' | 'reorder' };

export function ProductPicker({ options, kind }: Props) {
  const [state, action, pending] = useActionState<OrderRequestState, FormData>(submitOrderRequest, {
    ok: false,
  });
  // selection key: `${slug}__${strength}` → quantity
  const [sel, setSel] = useState<Record<string, number>>({});

  const groups = useMemo(() => {
    const m = new Map<string, ProductOption[]>();
    for (const o of options) {
      const arr = m.get(o.slug) ?? [];
      arr.push(o);
      m.set(o.slug, arr);
    }
    return [...m.entries()];
  }, [options]);

  const items = Object.entries(sel)
    .filter(([, q]) => q > 0)
    .map(([k, q]) => {
      const [slug, strength] = k.split('__');
      return { product_slug: slug, strength_label: strength, quantity: q };
    });

  if (state.ok) {
    return (
      <div className="bg-white border border-cl-gray-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-cl-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-cl-success" />
        </div>
        <h3 className="text-lg font-semibold text-cl-navy mb-1">Request submitted</h3>
        <p className="text-sm text-cl-gray-500 mb-4">Clariven will review your selection and follow up.</p>
        <Link href="/portal/orders" className="text-sm text-cl-teal hover:text-cl-teal/80">
          View your requests →
        </Link>
      </div>
    );
  }

  const toggle = (key: string, on: boolean) =>
    setSel((s) => {
      const n = { ...s };
      if (on) n[key] = n[key] || 1;
      else delete n[key];
      return n;
    });
  const setQty = (key: string, q: number) =>
    setSel((s) => ({ ...s, [key]: Math.max(1, Math.min(999, Number.isFinite(q) ? q : 1)) }));

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100 max-h-[480px] overflow-y-auto">
        {groups.map(([slug, opts]) => (
          <div key={slug} className="p-4">
            <p className="text-sm font-semibold text-cl-navy mb-2">{prettifyProductName(slug)}</p>
            <div className="space-y-2">
              {opts.map((o) => {
                const key = `${o.slug}__${o.strength}`;
                const on = sel[key] != null;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 flex-1 text-sm text-cl-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => toggle(key, e.target.checked)}
                        className="accent-cl-teal"
                      />
                      <span>{o.strength}</span>
                    </label>
                    {on ? (
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={sel[key]}
                        onChange={(e) => setQty(key, parseInt(e.target.value, 10))}
                        aria-label={`Quantity for ${prettifyProductName(o.slug)} ${o.strength}`}
                        className="w-20 px-2 py-1 rounded border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-cl-navy mb-1.5">Note (optional)</label>
        <textarea
          name="note"
          rows={2}
          placeholder="Anything we should know about this request"
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy resize-none focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-cl-error bg-cl-error/5 border border-cl-error/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || items.length === 0}
        className="px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Submitting…' : `Submit request${items.length ? ` (${items.length})` : ''}`}
      </button>
    </form>
  );
}
