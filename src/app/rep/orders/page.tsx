import { requireActiveRep, listMyCommissions, myOrgNames } from '@/lib/rep/portal-queries';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Attributed orders — Clariven Labs' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;

// A rep is not an org member, so org-scoped order RLS hides orders from them.
// We surface the orders attributed to the rep (those that generated a
// commission) from the rep-readable commission ledger — order #-level pipeline
// visibility for unpaid orders is a later (admin-impersonation/support) feature.
export default async function RepOrdersPage() {
  await requireActiveRep();
  const { rows } = await listMyCommissions(200);
  const orgNames = await myOrgNames();

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">Attributed orders</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Orders on your assigned organizations that have generated a commission.
      </p>
      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No attributed orders yet.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cl-navy font-semibold truncate">
                  {orgNames.get(r.organization_id) ?? '(organization)'}
                </p>
                <p className="text-xs text-cl-gray-400 font-mono">
                  order {r.order_id.slice(0, 8)} · {formatDate(r.earned_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-cl-navy">{usd(r.commission_cents)}</p>
                <p className="text-[11px] text-cl-gray-400">{r.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
