import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getProfile } from '@/lib/auth/roles';
import { listOrgTickets } from '@/lib/support/queries';
import { SupportTicketList } from '@/components/support/SupportTicketList';

export const dynamic = 'force-dynamic';

export default async function PortalSupportPage() {
  const profile = await getProfile();
  const hasOrg = Boolean(profile?.organization_id);
  const tickets = hasOrg ? await listOrgTickets() : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-cl-navy">Support</h1>
          <p className="text-sm text-cl-gray-500 mt-1">
            Questions about orders, COAs, billing, or research-use compliance.
          </p>
        </div>
        {hasOrg ? (
          <Link
            href="/portal/support/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light"
          >
            <Plus className="w-4 h-4" />
            New ticket
          </Link>
        ) : null}
      </div>

      {hasOrg ? (
        <SupportTicketList tickets={tickets} basePath="/portal/support" mode="customer" />
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl px-4 py-10 text-center">
          <p className="text-sm text-cl-gray-600">
            Link your account to an organization to open a support ticket.
          </p>
          <Link href="/onboarding/attest" className="text-sm text-cl-teal font-semibold hover:underline mt-2 inline-block">
            Start onboarding →
          </Link>
        </div>
      )}
    </div>
  );
}
