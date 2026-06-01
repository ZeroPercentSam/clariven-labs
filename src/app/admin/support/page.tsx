import { requireAdmin } from '@/lib/auth/roles';
import { getAdminTicketCounts, listAdminTickets } from '@/lib/support/queries';
import { SupportTicketList } from '@/components/support/SupportTicketList';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  await requireAdmin();
  const [counts, tickets] = await Promise.all([getAdminTicketCounts(), listAdminTickets()]);

  const kpis = [
    { label: 'Open', value: counts.open },
    { label: 'In progress', value: counts.inProgress },
    { label: 'Resolved (7d)', value: counts.resolved7d },
    {
      label: 'Oldest open',
      value: counts.oldestOpenDays == null ? '—' : `${counts.oldestOpenDays}d`,
      alert: counts.oldestOpenDays != null && counts.oldestOpenDays >= 3,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-cl-navy mb-1">Support</h1>
      <p className="text-sm text-cl-gray-500 mb-6">Customer tickets across all organizations.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-cl-gray-200 rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-cl-gray-400">{k.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${k.alert ? 'text-red-600' : 'text-cl-navy'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {tickets.length >= 200 ? (
        <p className="text-[11px] text-cl-gray-400 mb-2">
          Showing the 200 most recently updated tickets.
        </p>
      ) : null}
      <SupportTicketList tickets={tickets} basePath="/admin/support" mode="admin" />
    </div>
  );
}
