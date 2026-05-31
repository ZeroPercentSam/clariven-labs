import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, XCircle, PauseCircle } from 'lucide-react';
import { getOrg } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Account under review — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function OnboardingPendingPage() {
  const org = await getOrg();
  if (!org) redirect('/onboarding/attest');
  if (org.approval_status === 'approved') redirect('/portal');

  // Surface the latest attestation's rejection reason, if the org was rejected.
  let rejectionReason: string | null = null;
  if (org.approval_status === 'rejected') {
    const supabase = await createClient();
    const { data: att } = await supabase
      .from('org_attestations')
      .select('rejection_reason')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    rejectionReason = att?.rejection_reason ?? null;
  }

  const view = {
    pending: {
      Icon: Clock,
      tone: 'text-cl-teal',
      title: 'Your account is under review',
      body: 'Thanks — we received your research-use attestation. An admin reviews each new organization before ordering is enabled. You’ll be able to order as soon as it’s approved.',
    },
    suspended: {
      Icon: PauseCircle,
      tone: 'text-amber-500',
      title: 'Your organization is suspended',
      body: 'Ordering is paused for this organization. Contact support to restore access.',
    },
    rejected: {
      Icon: XCircle,
      tone: 'text-red-500',
      title: 'We couldn’t approve this account',
      body: 'Your research-use attestation wasn’t approved. Reach out to support and we’ll help sort it out.',
    },
  }[org.approval_status] ?? {
    Icon: Clock,
    tone: 'text-cl-teal',
    title: 'Your account is under review',
    body: 'An admin is reviewing your organization.',
  };

  const { Icon } = view;

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-lg mx-auto text-center">
        <Icon className={`w-12 h-12 mx-auto mb-4 ${view.tone}`} />
        <h1 className="text-2xl font-bold text-cl-navy mb-2">{view.title}</h1>
        <p className="text-cl-gray-500 text-sm leading-relaxed">{view.body}</p>

        <div className="mt-4 inline-block rounded-lg bg-cl-gray-50 border border-cl-gray-200 px-4 py-2 text-left">
          <div className="text-[11px] uppercase tracking-wider text-cl-gray-400">Organization</div>
          <div className="text-sm font-semibold text-cl-navy">{org.name}</div>
          <div className="text-xs text-cl-gray-500 mt-0.5">
            Status: <span className="font-mono">{org.approval_status}</span>
          </div>
        </div>

        {rejectionReason ? (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-left">
            <span className="font-semibold">Reviewer note:</span> {rejectionReason}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <Link href="/portal" className="text-cl-teal hover:text-cl-teal-light">
            Go to portal
          </Link>
          <span className="text-cl-gray-300">·</span>
          <a href="mailto:support@clarivenlabs.com" className="text-cl-teal hover:text-cl-teal-light">
            Contact support
          </a>
        </div>
      </div>
    </main>
  );
}
