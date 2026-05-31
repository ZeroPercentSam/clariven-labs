import { requireActiveRep, listMyCodes } from '@/lib/rep/portal-queries';
import { createRepCode } from '@/lib/rep/code-actions';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'My codes — Clariven Labs' };
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-cl-teal/10 text-cl-teal',
  rejected: 'bg-red-100 text-red-700',
};

export default async function RepCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireActiveRep();
  const { ok, error } = await searchParams;
  const codes = await listMyCodes();

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">Discount codes</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Mint a code for your customers. It stays <span className="font-semibold">pending</span> until
        an admin approves it — only then does it apply at checkout and earn you commission.
      </p>

      {ok ? (
        <p className="mb-4 text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Code submitted — pending admin approval.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <form
        action={createRepCode}
        className="bg-white border border-cl-gray-200 rounded-xl p-5 flex flex-wrap items-end gap-3 mb-8"
      >
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-cl-gray-400 mb-1">Code</span>
          <input
            name="code"
            required
            placeholder="LABRESEARCH10"
            className="bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-cl-teal/60"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide text-cl-gray-400 mb-1">Discount %</span>
          <input
            name="discount_pct"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            placeholder="10"
            className="w-28 bg-white border border-cl-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cl-teal/60"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Submit code
        </button>
      </form>

      {codes.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No codes yet.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {codes.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cl-navy font-mono font-semibold">{c.code}</p>
                <p className="text-xs text-cl-gray-400">
                  {c.discount_pct}% off · created {formatDate(c.created_at)}
                  {c.approval_status === 'rejected' && c.rejected_reason
                    ? ` · ${c.rejected_reason}`
                    : ''}
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_STYLES[c.approval_status] ?? 'bg-cl-gray-100 text-cl-gray-600'
                }`}
              >
                {c.approval_status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
