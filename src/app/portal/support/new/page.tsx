import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProfile } from '@/lib/auth/roles';
import { listLinkableOrders } from '@/lib/support/queries';
import { TicketCreateForm } from '@/components/support/TicketCreateForm';

export const dynamic = 'force-dynamic';

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect('/portal/onboarding');

  const { order } = await searchParams;
  const linkableOrders = await listLinkableOrders();
  const defaultOrderId = order && linkableOrders.some((o) => o.id === order) ? order : undefined;

  return (
    <div className="max-w-2xl">
      <Link
        href="/portal/support"
        className="inline-flex items-center gap-1.5 text-sm text-cl-gray-500 hover:text-cl-navy mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to support
      </Link>
      <h1 className="text-2xl font-semibold text-cl-navy mb-1">Open a ticket</h1>
      <p className="text-sm text-cl-gray-500 mb-6">
        Our team typically replies within one business day.
      </p>
      <TicketCreateForm linkableOrders={linkableOrders} defaultOrderId={defaultOrderId} />
    </div>
  );
}
