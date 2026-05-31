import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { acceptInvitation } from '@/lib/invitations/actions';

export const metadata = { title: 'Team invitation — Clariven Labs' };
export const dynamic = 'force-dynamic';

type Preview = {
  organization_name: string;
  email: string;
  org_role: string;
  status: string;
  is_expired: boolean;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-md mx-auto text-center">
        <Building2 className="w-10 h-10 text-cl-teal mx-auto mb-4" />
        {children}
      </div>
    </main>
  );
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: previewRaw } = await supabase.rpc('get_invitation_preview', { p_token: token });
  const preview = previewRaw ? (previewRaw as unknown as Preview) : null;

  const { data: auth } = await supabase.auth.getUser();
  const userEmail = auth.user?.email?.toLowerCase() ?? null;

  if (!preview) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-cl-navy mb-2">Invitation not found</h1>
        <p className="text-cl-gray-500 text-sm">This invite link is invalid or was removed.</p>
      </Shell>
    );
  }

  const invalidReason =
    preview.status === 'accepted'
      ? 'This invitation has already been accepted.'
      : preview.status === 'revoked'
        ? 'This invitation was revoked.'
        : preview.is_expired || preview.status === 'expired'
          ? 'This invitation has expired.'
          : null;

  if (invalidReason) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-cl-navy mb-2">Invitation unavailable</h1>
        <p className="text-cl-gray-500 text-sm">{invalidReason}</p>
        <Link href="/portal" className="inline-block mt-6 text-cl-teal text-sm hover:text-cl-teal-light">
          Go to portal
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">
        Join {preview.organization_name}
      </h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        You&apos;ve been invited as <span className="font-semibold">{preview.org_role}</span> ·{' '}
        <span className="font-mono">{preview.email}</span>
      </p>

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-left">
          {error}
        </p>
      ) : null}

      {!userEmail ? (
        <div className="space-y-3">
          <p className="text-sm text-cl-gray-600">
            Sign in (or create an account) with{' '}
            <span className="font-mono text-cl-navy">{preview.email}</span> to accept.
          </p>
          <Link
            href={`/login?next=/invite/${token}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
          >
            Sign in to accept
          </Link>
          <p className="text-xs text-cl-gray-400">
            No account?{' '}
            <Link href="/signup" className="text-cl-teal hover:text-cl-teal-light">
              Create one
            </Link>{' '}
            with the invited email, then reopen this link.
          </p>
        </div>
      ) : userEmail === preview.email.toLowerCase() ? (
        <form action={acceptInvitation}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
          >
            Accept &amp; join {preview.organization_name}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-cl-gray-600">
            This invitation is for{' '}
            <span className="font-mono text-cl-navy">{preview.email}</span>, but you&apos;re signed
            in as <span className="font-mono text-cl-navy">{userEmail}</span>.
          </p>
          <form action="/logout" method="POST">
            <button type="submit" className="text-sm text-cl-teal hover:text-cl-teal-light">
              Sign out and use the invited email
            </button>
          </form>
        </div>
      )}
    </Shell>
  );
}
