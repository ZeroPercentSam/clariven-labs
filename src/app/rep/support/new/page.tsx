import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireActiveRep } from '@/lib/rep/portal-queries';
import { TicketCreateForm } from '@/components/support/TicketCreateForm';

export const metadata = { title: 'New rep ticket — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function NewRepTicketPage() {
  await requireActiveRep();

  return (
    <div className="max-w-2xl">
      <Link
        href="/rep/support"
        className="inline-flex items-center gap-1.5 text-sm text-cl-gray-500 hover:text-cl-navy mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to support
      </Link>
      <h1 className="text-2xl font-semibold text-cl-navy mb-1">Open a ticket</h1>
      <p className="text-sm text-cl-gray-500 mb-6">
        Our team typically replies within one business day.
      </p>
      <TicketCreateForm repMode />
    </div>
  );
}
