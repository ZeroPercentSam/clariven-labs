import { formatDateTime } from '@/lib/format-datetime';
import type { TicketDetail, TicketMessage } from '@/lib/support/queries';

// Presentational thread: the original request followed by every reply. Internal
// notes are styled distinctly + tagged — they only reach this component for
// admins (the tmsg_read RLS hides them from customers at the DB layer).

function Bubble({
  author,
  isStaff,
  isInternal,
  at,
  body,
}: {
  author: string;
  isStaff: boolean;
  isInternal: boolean;
  at: string;
  body: string;
}) {
  return (
    <li className={`px-4 py-3 ${isInternal ? 'bg-amber-50/60' : isStaff ? 'bg-cl-gray-50' : 'bg-white'}`}>
      <div className="flex items-center gap-2 text-[11px] text-cl-gray-500 mb-1 uppercase tracking-wider">
        <span className="text-cl-navy font-semibold">{author}</span>
        {isStaff ? <span className="text-cl-teal">Clariven team</span> : null}
        {isInternal ? (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 normal-case tracking-normal">
            Internal note
          </span>
        ) : null}
        <span>·</span>
        <span>{formatDateTime(at)}</span>
      </div>
      <p className="text-sm text-cl-navy whitespace-pre-wrap">{body}</p>
    </li>
  );
}

export function TicketThread({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
      <ul className="divide-y divide-cl-gray-100">
        <Bubble
          author={ticket.createdByName ?? ticket.createdByEmail ?? 'Customer'}
          isStaff={false}
          isInternal={false}
          at={ticket.createdAt}
          body={ticket.body}
        />
        {ticket.messages.map((m: TicketMessage) => (
          <Bubble
            key={m.id}
            author={m.authorName ?? m.authorEmail ?? 'User'}
            isStaff={m.authorIsStaff}
            isInternal={m.isInternal}
            at={m.createdAt}
            body={m.body}
          />
        ))}
      </ul>
    </div>
  );
}
