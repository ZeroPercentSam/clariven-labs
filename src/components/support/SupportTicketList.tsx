'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/format-datetime';
import { formatTicketNumber, ticketCategoryLabel } from '@/lib/support/constants';
import type { TicketSummary } from '@/lib/support/queries';
import { TicketPriorityBadge, TicketStatusBadge } from './TicketStatusBadge';

// Client-side chip filter over the server-passed, bounded ticket list. State
// lives in the browser (useState + useMemo) so chips never round-trip to the
// server — the project's documented pattern that sidesteps the Next-16 RSC
// freeze class. No URL sync needed (the list is small + ephemeral).

type Mode = 'customer' | 'admin' | 'rep';
type Chip = { value: string; label: string; match: (t: TicketSummary) => boolean };

const ACTIVE = new Set(['open', 'in_progress', 'waiting_customer']);

function chipsFor(mode: Mode): Chip[] {
  // customer + rep share the simple All/Active/Resolved chips; admin gets the
  // full status breakdown.
  if (mode !== 'admin') {
    return [
      { value: 'all', label: 'All', match: () => true },
      { value: 'active', label: 'Active', match: (t) => ACTIVE.has(t.status) },
      { value: 'resolved', label: 'Resolved', match: (t) => t.status === 'resolved' || t.status === 'closed' },
    ];
  }
  return [
    { value: 'all', label: 'All', match: () => true },
    { value: 'open', label: 'Open', match: (t) => t.status === 'open' },
    { value: 'in_progress', label: 'In progress', match: (t) => t.status === 'in_progress' },
    { value: 'waiting_customer', label: 'Awaiting reply', match: (t) => t.status === 'waiting_customer' },
    { value: 'resolved', label: 'Resolved', match: (t) => t.status === 'resolved' },
    { value: 'closed', label: 'Closed', match: (t) => t.status === 'closed' },
  ];
}

export function SupportTicketList({
  tickets,
  basePath,
  mode,
}: {
  tickets: TicketSummary[];
  basePath: string;
  mode: Mode;
}) {
  const chips = useMemo(() => chipsFor(mode), [mode]);
  const [selected, setSelected] = useState<string>('all');

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of chips) m[c.value] = tickets.filter(c.match).length;
    return m;
  }, [chips, tickets]);

  const active = chips.find((c) => c.value === selected) ?? chips[0];
  const filtered = useMemo(() => tickets.filter(active.match), [tickets, active]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setSelected(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              selected === c.value
                ? 'bg-cl-navy text-white border-cl-navy'
                : 'bg-white text-cl-gray-600 border-cl-gray-200 hover:border-cl-gray-300'
            }`}
          >
            {c.label}
            <span className="ml-1.5 opacity-70">{counts[c.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl px-4 py-10 text-center text-sm text-cl-gray-500">
          No tickets here yet.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-cl-gray-500 border-b border-cl-gray-200">
                <th className="text-left font-semibold px-4 py-2.5">Ticket</th>
                <th className="text-left font-semibold px-4 py-2.5">Subject</th>
                {mode === 'admin' ? (
                  <th className="text-left font-semibold px-4 py-2.5">Organization</th>
                ) : (
                  <th className="text-left font-semibold px-4 py-2.5">Category</th>
                )}
                <th className="text-left font-semibold px-4 py-2.5">Status</th>
                <th className="text-left font-semibold px-4 py-2.5">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-cl-gray-50">
                  <td className="px-4 py-3 align-top">
                    <Link href={`${basePath}/${t.id}`} className="font-mono text-xs text-cl-teal hover:underline">
                      {formatTicketNumber(t.ticketNumber)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link href={`${basePath}/${t.id}`} className="text-cl-navy font-medium hover:underline">
                      {t.subject}
                    </Link>
                    {mode === 'admin' && t.createdByEmail ? (
                      <p className="text-[11px] text-cl-gray-400 mt-0.5">{t.createdByEmail}</p>
                    ) : null}
                  </td>
                  {mode === 'admin' ? (
                    <td className="px-4 py-3 align-top text-cl-gray-600">{t.organizationName ?? 'Rep'}</td>
                  ) : (
                    <td className="px-4 py-3 align-top text-cl-gray-600">{ticketCategoryLabel(t.category)}</td>
                  )}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1.5">
                      <TicketStatusBadge status={t.status} />
                      <TicketPriorityBadge priority={t.priority} />
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-cl-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(t.lastMessageAt ?? t.updatedAt)}
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
