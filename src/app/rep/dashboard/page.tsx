import Link from 'next/link';
import { requireActiveRep, getCommissionSummary, listMyAssignments } from '@/lib/rep/portal-queries';

export const metadata = { title: 'Rep dashboard — Clariven Labs' };
export const dynamic = 'force-dynamic';

const usd = (c: number) => `$${(c / 100).toFixed(2)}`;

export default async function RepDashboardPage() {
  await requireActiveRep();
  const summary = await getCommissionSummary();
  const assignments = await listMyAssignments();
  const activeOrgs = assignments.filter((a) => a.ended_at === null).length;

  const cards = [
    { label: 'Unpaid commission', value: usd(summary.earnedCents), sub: `${summary.earnedCount} earned` },
    { label: 'Paid out', value: usd(summary.paidCents), sub: 'lifetime' },
    { label: 'Active organizations', value: String(activeOrgs), sub: `${assignments.length} total` },
    { label: 'Reversed', value: String(summary.voidCount), sub: 'voided commissions' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-cl-gray-200 rounded-xl p-5">
            <p className="text-2xl font-bold text-cl-navy">{c.value}</p>
            <p className="text-xs text-cl-gray-500 mt-1">{c.label}</p>
            <p className="text-[11px] text-cl-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-cl-gray-200 rounded-xl p-6">
        <p className="text-sm text-cl-gray-600">
          Commission accrues on paid orders for your assigned organizations (margin base × your
          rate). See{' '}
          <Link href="/rep/commissions" className="text-cl-teal hover:text-cl-teal/80">
            Commissions
          </Link>{' '}
          for the full ledger.
        </p>
      </div>
    </div>
  );
}
