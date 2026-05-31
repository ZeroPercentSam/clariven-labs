import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getRepInvitationPreview } from '@/lib/rep/queries';
import { signUpRepFromInvite, acceptRepInvitation } from '@/lib/rep/actions';

export const metadata = {
  title: 'Sales rep invitation — Clariven Labs',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-md mx-auto">
        <Briefcase className="w-10 h-10 text-cl-teal mx-auto mb-4" />
        {children}
      </div>
    </main>
  );
}

export default async function RepInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const { token } = await params;
  const { error, signup } = await searchParams;

  const preview = await getRepInvitationPreview(token);
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userEmail = auth.user?.email?.toLowerCase() ?? null;

  const errorBox = error ? (
    <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {error}
    </p>
  ) : null;

  if (!preview) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-cl-navy mb-2 text-center">Invitation not found</h1>
        <p className="text-cl-gray-500 text-sm text-center">
          This invite link is invalid or was removed.
        </p>
      </Shell>
    );
  }

  const invalidReason =
    preview.status === 'accepted'
      ? 'This invitation has already been accepted. Sign in to continue.'
      : preview.status === 'revoked'
        ? 'This invitation was revoked. Contact the admin who invited you for a new one.'
        : preview.is_expired || preview.status === 'expired'
          ? 'This invitation has expired. Invitations are valid for 14 days.'
          : null;

  if (invalidReason) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-cl-navy mb-2 text-center">Invitation unavailable</h1>
        <p className="text-cl-gray-500 text-sm text-center">{invalidReason}</p>
        <div className="text-center mt-6">
          <Link href="/login" className="text-cl-teal text-sm hover:text-cl-teal/80">
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  // Pending. Branch on auth state.
  if (signup === 'check_email') {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-cl-navy mb-2 text-center">Check your email</h1>
        <p className="text-cl-gray-500 text-sm text-center">
          We sent a confirmation link to{' '}
          <span className="font-mono text-cl-navy">{preview.email}</span>. Click it to activate your
          account — you&apos;ll come right back here to accept the invitation.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-cl-navy mb-1 text-center">
        Join the Clariven Labs rep program
      </h1>
      <p className="text-cl-gray-500 text-sm mb-6 text-center">
        Invited as <span className="font-mono text-cl-navy">{preview.email}</span>
      </p>

      {errorBox}

      {!userEmail ? (
        <div className="space-y-4">
          {preview.invitation_note ? (
            <div className="rounded-lg border-l-4 border-cl-teal bg-cl-gray-50 px-4 py-3 text-sm text-cl-navy">
              <p className="text-xs uppercase tracking-wide text-cl-gray-500">Note from admin</p>
              <p className="mt-1 whitespace-pre-line">{preview.invitation_note}</p>
            </div>
          ) : null}
          <p className="text-sm text-cl-gray-600">
            Create your rep account with{' '}
            <span className="font-mono text-cl-navy">{preview.email}</span> to get started.
          </p>
          <form
            action={signUpRepFromInvite}
            className="bg-cl-gray-50 border border-cl-gray-200 rounded-xl p-5 space-y-4"
          >
            <input type="hidden" name="token" value={token} />
            <label className="block">
              <span className="block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5">
                Email
              </span>
              <input
                type="email"
                value={preview.email}
                readOnly
                aria-label="Invited email"
                className="w-full bg-cl-gray-100 border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-gray-500 text-sm font-mono cursor-not-allowed"
              />
            </label>
            <label className="block">
              <span className="block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5">
                Choose a password
              </span>
              <input
                type="password"
                name="password"
                required
                autoComplete="new-password"
                minLength={10}
                className="w-full bg-white border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-navy text-sm focus:outline-none focus:border-cl-teal/60"
              />
              <span className="block mt-1 text-cl-gray-400 text-xs">10 characters minimum.</span>
            </label>
            <button
              type="submit"
              className="w-full px-5 py-3 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
            >
              Create rep account
            </button>
          </form>
          <p className="text-center text-cl-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              href={`/login?next=/rep-invite/${encodeURIComponent(token)}`}
              className="text-cl-teal hover:text-cl-teal/80"
            >
              Sign in to accept
            </Link>
          </p>
        </div>
      ) : userEmail === preview.email.toLowerCase() ? (
        <div className="space-y-4">
          {preview.invitation_note ? (
            <div className="rounded-lg border-l-4 border-cl-teal bg-cl-gray-50 px-4 py-3 text-sm text-cl-navy">
              <p className="text-xs uppercase tracking-wide text-cl-gray-500">Note from admin</p>
              <p className="mt-1 whitespace-pre-line">{preview.invitation_note}</p>
            </div>
          ) : null}
          <p className="text-sm text-cl-gray-600">
            Accepting activates the rep role on your account and takes you to onboarding (W-9, payout
            details, and signing the rep agreement — about 10 minutes).
          </p>
          <form action={acceptRepInvitation}>
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="w-full px-5 py-3 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
            >
              Accept &amp; start onboarding
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-cl-gray-600">
            This invitation is for{' '}
            <span className="font-mono text-cl-navy">{preview.email}</span>, but you&apos;re signed
            in as <span className="font-mono text-cl-navy">{userEmail}</span>.
          </p>
          <form action="/logout" method="POST">
            <button type="submit" className="text-sm text-cl-teal hover:text-cl-teal/80">
              Sign out and use the invited email
            </button>
          </form>
        </div>
      )}
    </Shell>
  );
}
