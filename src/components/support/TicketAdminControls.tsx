'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import { assignTicketToMe, setTicketPriority, setTicketStatus } from '@/lib/support/actions';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  ticketPriorityLabel,
  ticketStatusLabel,
} from '@/lib/support/constants';

export function TicketAdminControls({
  ticketId,
  status,
  priority,
  assignedToName,
}: {
  ticketId: string;
  status: string;
  priority: string;
  assignedToName: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? 'Action failed.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="text-cl-navy font-semibold text-sm">Triage</h3>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Status
        </span>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => run(() => setTicketStatus(ticketId, e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy disabled:opacity-50"
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ticketStatusLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Priority
        </span>
        <select
          value={priority}
          disabled={pending}
          onChange={(e) => run(() => setTicketPriority(ticketId, e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy disabled:opacity-50"
        >
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {ticketPriorityLabel(p)}
            </option>
          ))}
        </select>
      </label>

      <div className="pt-1">
        <p className="text-[11px] text-cl-gray-500 mb-1">
          Assigned to: <span className="text-cl-navy">{assignedToName ?? 'Unassigned'}</span>
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => assignTicketToMe(ticketId))}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cl-gray-200 text-xs font-semibold text-cl-navy hover:bg-cl-gray-50 disabled:opacity-50"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Assign to me
        </button>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
