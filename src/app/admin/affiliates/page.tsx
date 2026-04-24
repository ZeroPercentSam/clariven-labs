import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AffiliateCreate } from '@/components/admin/AffiliateCreate';

export const dynamic = 'force-dynamic';

export default async function AdminAffiliates() {
  const supabase = await createClient();

  const [{ data: affiliates }, { data: codes }, { data: paidOrders }] = await Promise.all([
    supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
    supabase.from('affiliate_codes').select('id, affiliate_id, code, discount_pct, active, expires_at'),
    supabase
      .from('orders')
      .select('affiliate_id, total_cents, discount_cents, status')
      .in('status', ['paid', 'preparing', 'shipped', 'delivered']),
  ]);

  const totals = new Map<
    string,
    { ordersCount: number; gross: number; discount: number }
  >();
  for (const o of paidOrders ?? []) {
    if (!o.affiliate_id) continue;
    const t = totals.get(o.affiliate_id) ?? { ordersCount: 0, gross: 0, discount: 0 };
    t.ordersCount += 1;
    t.gross += o.total_cents;
    t.discount += o.discount_cents;
    totals.set(o.affiliate_id, t);
  }

  const codesByAffiliate = new Map<string, number>();
  for (const c of codes ?? []) {
    codesByAffiliate.set(c.affiliate_id, (codesByAffiliate.get(c.affiliate_id) ?? 0) + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Affiliates</h1>
        <AffiliateCreate />
      </div>

      <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
        {(affiliates ?? []).length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">
            No affiliates yet. Create one to generate referral codes.
          </p>
        ) : (
          <ul className="divide-y divide-cl-gray-100">
            {(affiliates ?? []).map((a) => {
              const t = totals.get(a.id) ?? { ordersCount: 0, gross: 0, discount: 0 };
              const commission = a.commission_pct
                ? Math.floor((t.gross * Number(a.commission_pct)) / 100)
                : 0;
              return (
                <li key={a.id} className="px-5 py-3 flex items-center gap-4">
                  <Link
                    href={`/admin/affiliates/${a.id}`}
                    className="flex-1 min-w-0 text-cl-navy hover:text-cl-teal font-medium"
                  >
                    {a.name}
                  </Link>
                  <div className="text-xs text-cl-gray-500 w-28 text-right">
                    {codesByAffiliate.get(a.id) ?? 0} codes
                  </div>
                  <div className="text-xs text-cl-gray-500 w-28 text-right">
                    {t.ordersCount} orders
                  </div>
                  <div className="text-sm text-cl-navy w-28 text-right">
                    ${(t.gross / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-cl-teal w-28 text-right">
                    {commission > 0 ? `comm $${(commission / 100).toFixed(2)}` : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-cl-gray-400">
        Gross and commission reflect paid-and-later orders only. Discount shown on detail page.
      </p>
    </div>
  );
}
