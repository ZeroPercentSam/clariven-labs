import Link from 'next/link';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth/roles';
import { AddClientForm } from '@/components/clients/AddClientForm';

export const metadata = { title: 'Add client — Admin' };
export const dynamic = 'force-dynamic';

export default async function NewClientPage() {
  await requireAdmin();

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const loginUrl = `${siteUrl}/login`;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clients" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Clients
        </Link>
        <h1 className="text-2xl font-bold text-cl-navy mt-2">Add a client</h1>
        <p className="text-cl-gray-500 text-sm mt-1 max-w-lg">
          Creates the client company, provisions a portal login with a generated password, and seeds
          their onboarding checklist. Send the password to the client securely — it&apos;s shown once.
        </p>
      </div>
      <AddClientForm loginUrl={loginUrl} />
    </div>
  );
}
