import {
  TICKET_PRIORITY_BADGE,
  TICKET_STATUS_BADGE,
  ticketPriorityLabel,
  ticketStatusLabel,
} from '@/lib/support/constants';

// Pure presentational pills — usable in both server and client trees (no hooks).

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        TICKET_STATUS_BADGE[status] ?? 'bg-cl-gray-100 text-cl-gray-600'
      }`}
    >
      {ticketStatusLabel(status)}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  // Hide the noisy default — only flag elevated priorities.
  if (priority === 'normal') return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        TICKET_PRIORITY_BADGE[priority] ?? 'bg-cl-gray-100 text-cl-gray-600'
      }`}
    >
      {ticketPriorityLabel(priority)}
    </span>
  );
}
