import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { acceptInvitation, signUpFromInvite } from '@/lib/invitations/actions';

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
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const { token } = await params;
  const { error, signup } = await searchParams;
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
        signup === 'check_email' ? (
          <p className="text-sm text-cl-gray-600 bg-cl-gray-50 border border-cl-gray-200 rounded-lg px-4 py-3">
            Check your inbox — we sent a confirmation link to{' '}
            <span className="font-mono text-cl-navy">{preview.email}</span>. Click it to finish
            setting up your account, then you&apos;ll land back here to accept.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-cl-gray-600">
                Already have an account? Sign in with{' '}
                <span className="font-mono text-cl-navy">{preview.email}</span> to accept.
              </p>
              <Link
                href={`/login?next=/invite/${token}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
              >
                Sign in to accept
              </Link>
            </div>

            <div className="border-t border-cl-gray-200 pt-5 text-left">
              <p className="text-sm text-cl-gray-600 mb-3 text-center">
                New here? Create your account with the invited email:
              </p>
              <form action={signUpFromInvite} className="space-y-3">
                <input type="hidden" name="token" value={token} />
                <input
                  type="email"
                  value={preview.email}
                  readOnly
                  disabled
                  className="w-full rounded-lg border border-cl-gray-200 bg-cl-gray-50 px-3 py-2 text-sm font-mono text-cl-gray-500"
                />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder="Create a password (min 10 characters)"
                  className="w-full rounded-lg border border-cl-gray-200 bg-white px-3 py-2 text-sm text-cl-navy focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cl-navy text-white font-semibold hover:bg-cl-navy-light transition"
                >
                  Create account &amp; continue
                </button>
              </form>
            </div>
          </div>
        )
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
