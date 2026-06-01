import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/roles';
import { getTicketWithMessages } from '@/lib/support/queries';
import { formatTicketNumber, ticketCategoryLabel } from '@/lib/support/constants';
import { formatDateTime } from '@/lib/format-datetime';
import { TicketThread } from '@/components/support/TicketThread';
import { TicketReplyForm } from '@/components/support/TicketReplyForm';
import { TicketAdminControls } from '@/components/support/TicketAdminControls';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const ticket = await getTicketWithMessages(id);
  if (!ticket) notFound();

  return (
    <div>
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-sm text-cl-gray-500 hover:text-cl-navy mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to support
      </Link>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-xs text-cl-gray-400">{formatTicketNumber(ticket.ticketNumber)}</p>
          <h1 className="text-2xl font-semibold text-cl-navy">{ticket.subject}</h1>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        <div className="space-y-4">
          <TicketThread ticket={ticket} />
          <TicketReplyForm ticketId={ticket.id} canMarkInternal />
        </div>

        <aside className="space-y-3">
          <TicketAdminControls
            ticketId={ticket.id}
            status={ticket.status}
            priority={ticket.priority}
            assignedToName={ticket.assignedToName}
          />
          <div className="bg-white border border-cl-gray-200 rounded-xl p-4 text-sm space-y-2">
            <Row label="Organization" value={ticket.organizationName ?? '—'} />
            <Row label="Opened by" value={ticket.createdByName ?? ticket.createdByEmail ?? '—'} />
            <Row label="Category" value={ticketCategoryLabel(ticket.category)} />
            <Row label="Opened" value={formatDateTime(ticket.createdAt)} />
            {ticket.orderId ? (
              <Row
                label="Order"
                value={
                  <Link href={`/admin/orders/${ticket.orderId}`} className="text-cl-teal hover:underline">
                    #{ticket.orderNumber}
                  </Link>
                }
              />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-cl-gray-400">{label}</span>
      <span className="text-cl-navy text-right">{value}</span>
    </div>
  );
}
