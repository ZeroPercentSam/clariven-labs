import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AffiliateCreate } from '@/components/admin/AffiliateCreate';

export const dynamic = 'force-dynamic';

const PAID_STATES = ['paid', 'preparing', 'shipped', 'delivered'] as const;

export default async function AdminAffiliates() {
  const supabase = await createClient();

  const [{ data: affiliates }, { data: codes }, { data: paidOrders }] = await Promise.all([
    supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
    supabase
      .from('affiliate_codes')
      .select('id, affiliate_id, code, discount_pct, active, expires_at')
      .order('code', { ascending: true }),
    supabase
      .from('orders')
      .select('affiliate_id, applied_code_id, total_cents, discount_cents, status')
      .in('status', [...PAID_STATES]),
  ]);

  // Per-affiliate aggregates
  const affTotals = new Map<string, { ordersCount: number; gross: number; discount: number }>();
  // Per-code aggregates
  const codeTotals = new Map<string, { ordersCount: number; gross: number; discount: number }>();

  for (const o of paidOrders ?? []) {
    if (o.affiliate_id) {
      const t = affTotals.get(o.affiliate_id) ?? { ordersCount: 0, gross: 0, discount: 0 };
      t.ordersCount += 1;
      t.gross += o.total_cents;
      t.discount += o.discount_cents;
      affTotals.set(o.affiliate_id, t);
    }
    if (o.applied_code_id) {
      const t = codeTotals.get(o.applied_code_id) ?? { ordersCount: 0, gross: 0, discount: 0 };
      t.ordersCount += 1;
      t.gross += o.total_cents;
      t.discount += o.discount_cents;
      codeTotals.set(o.applied_code_id, t);
    }
  }

  const affiliateName = new Map((affiliates ?? []).map((a) => [a.id, a.name] as const));
  const codesByAffiliate = new Map<string, typeof codes>();
  for (const c of codes ?? []) {
    const list = codesByAffiliate.get(c.affiliate_id) ?? [];
    list.push(c);
    codesByAffiliate.set(c.affiliate_id, list);
  }

  return (
    <div className="space-y-8">
      {/* Affiliates list with totals */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-cl-navy">Affiliates</h1>
          <AffiliateCreate />
        </div>

        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_90px_110px_110px] gap-3 px-5 py-2 bg-cl-gray-50 text-[11px] uppercase tracking-wider text-cl-gray-500 font-semibold">
            <div>Affiliate</div>
            <div className="text-right">Codes</div>
            <div className="text-right">Orders</div>
            <div className="text-right">Gross</div>
            <div className="text-right">Commission</div>
          </div>
          {(affiliates ?? []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">
              No affiliates yet. Create one to generate referral codes.
            </p>
          ) : (
            <ul className="divide-y divide-cl-gray-100">
              {(affiliates ?? []).map((a) => {
                const t = affTotals.get(a.id) ?? { ordersCount: 0, gross: 0, discount: 0 };
                const commission = a.commission_pct
                  ? Math.floor((t.gross * Number(a.commission_pct)) / 100)
                  : 0;
                return (
                  <li
                    key={a.id}
                    className="grid grid-cols-[1fr_90px_90px_110px_110px] gap-3 px-5 py-3 items-center"
                  >
                    <Link
                      href={`/admin/affiliates/${a.id}`}
                      className="text-cl-navy hover:text-cl-teal font-medium truncate"
                    >
                      {a.name}
                      {!a.active ? (
                        <span className="ml-2 text-[10px] text-cl-gray-400 uppercase tracking-wider">
                          inactive
                        </span>
                      ) : null}
                    </Link>
                    <div className="text-xs text-cl-gray-500 text-right">
                      {(codesByAffiliate.get(a.id) ?? []).length}
                    </div>
                    <div className="text-xs text-cl-gray-500 text-right">{t.ordersCount}</div>
                    <div className="text-sm text-cl-navy text-right">
                      ${(t.gross / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-cl-teal text-right">
                      {commission > 0 ? `$${(commission / 100).toFixed(2)}` : '—'}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Code performance — every code, every affiliate */}
      <section>
        <h2 className="text-xl font-bold text-cl-navy mb-4">Code performance</h2>
        <p className="text-cl-gray-500 text-xs mb-3">
          Aggregates count orders that have moved past payment (status in
          paid / preparing / shipped / delivered). Pending and cancelled orders
          are excluded.
        </p>
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_70px_60px_90px_110px_110px] gap-3 px-5 py-2 bg-cl-gray-50 text-[11px] uppercase tracking-wider text-cl-gray-500 font-semibold">
            <div>Code</div>
            <div>Affiliate</div>
            <div className="text-right">% off</div>
            <div className="text-right">Status</div>
            <div className="text-right">Paid orders</div>
            <div className="text-right">Gross</div>
            <div className="text-right">Discount given</div>
          </div>
          {(codes ?? []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">
              No codes created yet.
            </p>
          ) : (
            <ul className="divide-y divide-cl-gray-100">
              {(codes ?? []).map((c) => {
                const t = codeTotals.get(c.id) ?? { ordersCount: 0, gross: 0, discount: 0 };
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                const status = !c.active
                  ? { label: 'inactive', cls: 'text-cl-gray-400' }
                  : expired
                    ? { label: 'expired', cls: 'text-amber-600' }
                    : { label: 'active', cls: 'text-emerald-600' };
                return (
                  <li
                    key={c.id}
                    className="grid grid-cols-[140px_1fr_70px_60px_90px_110px_110px] gap-3 px-5 py-3 items-center"
                  >
                    <span className="font-mono text-cl-navy text-sm tracking-wider truncate">
                      {c.code}
                    </span>
                    <Link
                      href={`/admin/affiliates/${c.affiliate_id}`}
                      className="text-sm text-cl-navy hover:text-cl-teal truncate"
                    >
                      {affiliateName.get(c.affiliate_id) ?? '—'}
                    </Link>
                    <div className="text-xs text-cl-gray-500 text-right">
                      {Number(c.discount_pct)}%
                    </div>
                    <div className={`text-[11px] uppercase tracking-wider text-right ${status.cls}`}>
                      {status.label}
                    </div>
                    <div className="text-sm text-cl-navy text-right font-medium">
                      {t.ordersCount}
                    </div>
                    <div className="text-sm text-cl-navy text-right">
                      ${(t.gross / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-cl-teal text-right">
                      ${(t.discount / 100).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
