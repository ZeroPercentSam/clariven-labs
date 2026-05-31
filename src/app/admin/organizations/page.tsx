import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-cl-teal/10 text-cl-teal',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-amber-50 text-amber-600',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] ?? 'bg-cl-gray-100 text-cl-gray-600'}`}
    >
      {status}
    </span>
  );
}

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewed?: string }>;
}) {
  const { reviewed } = await searchParams;
  const supabase = await createClient();

  // is_admin() RLS lets staff read every org. Pending first (the review queue),
  // then most-recent.
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, slug, approval_status, billing_email, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const rows = orgs ?? [];
  const pending = rows.filter((o) => o.approval_status === 'pending');
  const others = rows.filter((o) => o.approval_status !== 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-2">Organizations</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Review research-use attestations. Only <span className="font-semibold">approved</span>{' '}
        organizations can place orders.
      </p>

      {reviewed ? (
        <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Organization {reviewed}.
        </p>
      ) : null}

      <section className="mb-8">
        <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
          Pending review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white border border-cl-gray-200 rounded-xl p-6 text-center text-cl-gray-500 text-sm">
            <Building2 className="w-8 h-8 text-cl-gray-300 mx-auto mb-2" />
            Nothing waiting for review.
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((o) => (
              <OrgRow key={o.id} org={o} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
          All organizations ({others.length})
        </h2>
        <ul className="space-y-2">
          {others.map((o) => (
            <OrgRow key={o.id} org={o} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function OrgRow({
  org,
}: {
  org: {
    id: string;
    name: string;
    slug: string;
    approval_status: string;
    billing_email: string | null;
    created_at: string;
  };
}) {
  return (
    <li className="bg-white border border-cl-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-cl-teal/30 transition">
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/organizations/${org.id}`}
          className="text-cl-navy font-semibold hover:text-cl-teal"
        >
          {org.name}
        </Link>
        <div className="text-cl-gray-500 text-xs mt-1 font-mono">{org.slug}</div>
      </div>
      <div className="text-cl-gray-400 text-xs hidden sm:block">{formatDate(org.created_at)}</div>
      <StatusBadge status={org.approval_status} />
      <Link
        href={`/admin/organizations/${org.id}`}
        className="text-cl-teal text-sm inline-flex items-center gap-1 hover:text-cl-teal-light"
      >
        Review <ArrowRight className="w-4 h-4" />
      </Link>
    </li>
  );
}
