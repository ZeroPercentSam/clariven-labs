import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireActiveRep } from '@/lib/rep/portal-queries';
import { listRepTickets } from '@/lib/support/queries';
import { SupportTicketList } from '@/components/support/SupportTicketList';

export const metadata = { title: 'Rep support — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function RepSupportPage() {
  const rep = await requireActiveRep();
  const tickets = await listRepTickets(rep.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-cl-navy">Support</h1>
          <p className="text-sm text-cl-gray-500 mt-1">
            Questions about commissions, payouts, or your assigned organizations.
          </p>
        </div>
        <Link
          href="/rep/support/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light"
        >
          <Plus className="w-4 h-4" />
          New ticket
        </Link>
      </div>

      <SupportTicketList tickets={tickets} basePath="/rep/support" mode="rep" />
    </div>
  );
}
