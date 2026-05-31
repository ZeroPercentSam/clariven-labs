import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listPayoutBatches } from '@/lib/rep/commissions-admin';
import { formatDate } from '@/lib/format-datetime';

export const metadata = { title: 'Payouts — Admin' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  await requireAdmin();
  const { batch } = await searchParams;
  const batches = await listPayoutBatches();
  const grandTotal = batches.reduce((s, b) => s + b.total_cents, 0);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/commissions" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Commissions
        </Link>
        <h1 className="text-2xl font-bold text-cl-navy mt-2">Payout batches</h1>
        <p className="text-cl-gray-500 text-sm mt-1">
          {batches.length} batch{batches.length === 1 ? '' : 'es'} · {usd(grandTotal)} paid lifetime
        </p>
      </div>

      {batch ? (
        <p className="mb-4 text-sm text-cl-teal bg-cl-teal/5 border border-cl-teal/30 rounded-lg px-3 py-2">
          Batch <span className="font-mono">{batch}</span> created.
        </p>
      ) : null}

      {batches.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No payout batches yet. Use &ldquo;Mark all earned paid&rdquo; on the commissions page.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100">
          {batches.map((b) => (
            <div key={b.batch_id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cl-navy font-mono font-semibold truncate">{b.batch_id}</p>
                <p className="text-xs text-cl-gray-400">
                  {b.count} commission{b.count === 1 ? '' : 's'}
                  {b.paid_at ? ` · ${formatDate(b.paid_at)}` : ''}
                </p>
              </div>
              <p className="text-sm font-mono font-semibold text-cl-navy">{usd(b.total_cents)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
