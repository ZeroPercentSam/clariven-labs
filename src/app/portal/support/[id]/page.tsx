import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTicketWithMessages } from '@/lib/support/queries';
import { formatTicketNumber, ticketCategoryLabel } from '@/lib/support/constants';
import { formatDateTime } from '@/lib/format-datetime';
import { TicketThread } from '@/components/support/TicketThread';
import { TicketReplyForm } from '@/components/support/TicketReplyForm';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';

export const dynamic = 'force-dynamic';

export default async function PortalTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicketWithMessages(id);
  if (!ticket) notFound();

  const reopens = ticket.status === 'resolved' || ticket.status === 'waiting_customer';
  const closed = ticket.status === 'closed';

  return (
    <div>
      <Link
        href="/portal/support"
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

      <div className="grid lg:grid-cols-[1fr_240px] gap-6">
        <div className="space-y-4">
          <TicketThread ticket={ticket} />
          {closed ? (
            <p className="text-sm text-cl-gray-500 px-1">
              This ticket is closed. Open a new ticket if you need more help.
            </p>
          ) : (
            <TicketReplyForm ticketId={ticket.id} reopensOnReply={reopens} />
          )}
        </div>

        <aside className="space-y-3">
          <div className="bg-white border border-cl-gray-200 rounded-xl p-4 text-sm space-y-2">
            <Row label="Status" value={<TicketStatusBadge status={ticket.status} />} />
            <Row label="Category" value={ticketCategoryLabel(ticket.category)} />
            <Row label="Opened" value={formatDateTime(ticket.createdAt)} />
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
