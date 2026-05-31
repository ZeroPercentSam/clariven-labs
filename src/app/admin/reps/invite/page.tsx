import Link from 'next/link';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth/roles';
import { inviteRep } from '@/lib/rep/admin-actions';

export const metadata = { title: 'Invite a rep — Admin' };
export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  email: 'Enter a valid email address.',
  unavailable: "Can't reach the server right now. Try again shortly.",
};

export default async function AdminInviteRepPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  await requireAdmin();
  const { token, error } = await searchParams;

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const inviteUrl = token ? `${siteUrl}/rep-invite/${token}` : null;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/reps" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Reps
        </Link>
        <h1 className="text-2xl font-bold text-cl-navy mt-2">Invite a sales rep</h1>
        <p className="text-cl-gray-500 text-sm mt-1">
          Sends a 14-day invitation. Email delivery lands with Resend later — for now, copy the link
          below and share it directly.
        </p>
      </div>

      {inviteUrl ? (
        <div className="mb-6 rounded-xl border border-cl-teal/30 bg-cl-teal/5 p-4">
          <p className="text-sm font-semibold text-cl-navy mb-1">Invitation created ✓</p>
          <p className="text-xs text-cl-gray-500 mb-2">Share this link with the rep:</p>
          <code className="block text-xs font-mono text-cl-navy bg-white border border-cl-gray-200 rounded-lg px-3 py-2 break-all">
            {inviteUrl}
          </code>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {ERRORS[error] ?? error}
        </p>
      ) : null}

      <form
        action={inviteRep}
        className="bg-white border border-cl-gray-200 rounded-xl p-6 space-y-4 max-w-lg"
      >
        <label className="block">
          <span className="block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5">
            Rep email
          </span>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-white border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-navy text-sm focus:outline-none focus:border-cl-teal/60"
          />
        </label>
        <label className="block">
          <span className="block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5">
            Note (optional)
          </span>
          <textarea
            name="invitation_note"
            rows={3}
            maxLength={2000}
            className="w-full bg-white border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-navy text-sm focus:outline-none focus:border-cl-teal/60"
          />
        </label>
        <button
          type="submit"
          className="px-5 py-2.5 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
        >
          Create invitation
        </button>
      </form>
    </div>
  );
}
