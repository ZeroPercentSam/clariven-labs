import { requireActiveRep, listMyCommissions, myOrgNames } from '@/lib/rep/portal-queries';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Commissions — Clariven Labs' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;

const STATUS_STYLES: Record<string, string> = {
  earned: 'bg-amber-100 text-amber-700',
  paid: 'bg-cl-teal/10 text-cl-teal',
  void: 'bg-red-100 text-red-700',
};

export default async function RepCommissionsPage() {
  await requireActiveRep();
  const { rows, total } = await listMyCommissions(200);
  const orgNames = await myOrgNames();

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">Commissions</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        {total} total{total > 200 ? ' · showing the 200 most recent' : ''}.
      </p>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No commissions yet. They appear when an order on an assigned organization is paid.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cl-gray-50 text-cl-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-left px-4 py-2.5">Organization</th>
                <th className="text-left px-4 py-2.5">Source</th>
                <th className="text-right px-4 py-2.5">Base</th>
                <th className="text-right px-4 py-2.5">Rate</th>
                <th className="text-right px-4 py-2.5">Commission</th>
                <th className="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 text-cl-gray-500">{formatDate(r.earned_at)}</td>
                  <td className="px-4 py-2.5 text-cl-navy">
                    {orgNames.get(r.organization_id) ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-cl-gray-500">
                    {r.source === 'org_assignment' ? 'Org' : 'Code'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-cl-gray-600">{usd(r.base_cents)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-cl-gray-600">
                    {(Number(r.rate) * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-cl-navy">
                    {usd(r.commission_cents)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[r.status] ?? 'bg-cl-gray-100 text-cl-gray-600'
                      }`}
                    >
                      {r.status}
                    </span>
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
