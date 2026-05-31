import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import {
  listAllCommissions,
  commissionTotals,
  type CommissionFilter,
} from '@/lib/rep/commissions-admin';
import { markEarnedPaidBatch, voidCommission } from '@/lib/rep/commissions-admin-actions';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Commissions — Admin' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;
const FILTERS: CommissionFilter[] = ['all', 'earned', 'paid', 'void'];
const STATUS_STYLES: Record<string, string> = {
  earned: 'bg-amber-100 text-amber-700',
  paid: 'bg-cl-teal/10 text-cl-teal',
  void: 'bg-red-100 text-red-700',
};

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam, ok, error } = await searchParams;
  const status: CommissionFilter = (FILTERS as string[]).includes(statusParam ?? '')
    ? (statusParam as CommissionFilter)
    : 'all';

  const [{ rows, total }, totals] = await Promise.all([listAllCommissions(status), commissionTotals()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Commissions</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/commissions/payouts" className="text-sm text-cl-teal hover:text-cl-teal/80">
            Payouts &rarr;
          </Link>
          <a
            href="/admin/commissions/export"
            className="text-xs px-3 py-2 rounded-lg border border-cl-gray-200 text-cl-navy hover:bg-white"
          >
            Export CSV
          </a>
        </div>
      </div>

      {ok ? (
        <p className="mb-4 text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Done: {ok}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error === 'nothing_to_pay' ? 'No earned commissions to pay.' : error}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-cl-navy">{usd(totals.earnedCents)}</p>
          <p className="text-xs text-cl-gray-500 mt-1">Unpaid (earned)</p>
        </div>
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-cl-navy">{usd(totals.paidCents)}</p>
          <p className="text-xs text-cl-gray-500 mt-1">Paid out</p>
        </div>
        <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-cl-navy">{totals.voidCount}</p>
          <p className="text-xs text-cl-gray-500 mt-1">Voided</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === 'all' ? '/admin/commissions' : `/admin/commissions?status=${f}`}
              className={`text-xs px-3 py-1.5 rounded-full capitalize ${
                status === f ? 'bg-cl-navy text-white' : 'bg-white border border-cl-gray-200 text-cl-navy'
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
        <form action={markEarnedPaidBatch} className="flex items-center gap-2">
          <input
            name="note"
            placeholder="Batch note (optional)"
            className="bg-white border border-cl-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cl-teal/60"
          />
          <button
            type="submit"
            className="text-xs px-3 py-1.5 rounded-lg bg-cl-teal text-white font-semibold hover:bg-cl-teal/90"
          >
            Mark all earned paid
          </button>
        </form>
      </div>

      <p className="text-xs text-cl-gray-400 mb-2">
        {total} {status === 'all' ? 'total' : status}
        {total > 200 ? ' · showing 200 most recent' : ''}
      </p>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No commissions.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cl-gray-50 text-cl-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2.5">Date</th>
                <th className="text-left px-3 py-2.5">Rep</th>
                <th className="text-left px-3 py-2.5">Organization</th>
                <th className="text-left px-3 py-2.5">Src</th>
                <th className="text-right px-3 py-2.5">Base</th>
                <th className="text-right px-3 py-2.5">Commission</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 text-cl-gray-500 whitespace-nowrap">{formatDate(r.earned_at)}</td>
                  <td className="px-3 py-2.5 text-cl-navy font-mono text-xs truncate max-w-[160px]">
                    {r.rep_email ?? r.rep_user_id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2.5 text-cl-navy">{r.org_name ?? '—'}</td>
                  <td className="px-3 py-2.5 text-cl-gray-500">{r.source === 'org_assignment' ? 'Org' : 'Code'}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-cl-gray-600">{usd(r.base_cents)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-cl-navy">
                    {usd(r.commission_cents)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[r.status] ?? 'bg-cl-gray-100 text-cl-gray-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {r.status !== 'void' ? (
                      <form action={voidCommission}>
                        <input type="hidden" name="commission_id" value={r.id} />
                        <button type="submit" className="text-xs text-cl-gray-400 hover:text-red-500">
                          Void
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
