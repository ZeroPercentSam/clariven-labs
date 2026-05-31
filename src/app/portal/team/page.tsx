import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { inviteMember, revokeInvitation } from '@/lib/team/actions';
import { formatDate } from '@/lib/format-datetime';

export const dynamic = 'force-dynamic';

export default async function PortalTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; revoked?: string; error?: string }>;
}) {
  const { invited, revoked, error } = await searchParams;
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/portal/team');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single();
  if (!profile?.organization_id) redirect('/onboarding/attest');
  const orgId = profile.organization_id;

  // Only org owners/admins manage the team.
  const { data: me } = await supabase
    .from('org_members')
    .select('org_role')
    .eq('organization_id', orgId)
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (!me || !['owner', 'admin'].includes(me.org_role)) redirect('/portal');

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase.from('org_members').select('org_role, user_id, created_at').eq('organization_id', orgId),
    supabase
      .from('org_invitations')
      .select('id, email, org_role, status, token, expires_at, created_at')
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ]);

  const memberIds = (members ?? []).map((m) => m.user_id);
  const { data: memberProfiles } = memberIds.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', memberIds)
    : { data: [] };
  const profileById = new Map((memberProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-2">Team</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Invite colleagues to your organization. Anyone you invite joins the same account and shares
        its orders — no separate attestation needed.
      </p>

      {invited ? (
        <Banner tone="ok">Invitation created for {invited}. Share the link below.</Banner>
      ) : null}
      {revoked ? <Banner tone="ok">Invitation revoked.</Banner> : null}
      {error ? <Banner tone="err">{error}</Banner> : null}

      <section className="mb-8">
        <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
          Members ({members?.length ?? 0})
        </h2>
        <ul className="space-y-2">
          {(members ?? []).map((m) => {
            const p = profileById.get(m.user_id);
            return (
              <li
                key={m.user_id}
                className="bg-white border border-cl-gray-200 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <span className="text-cl-navy text-sm truncate">
                  {p?.full_name || p?.email || m.user_id}
                </span>
                <span className="text-xs text-cl-gray-400 font-mono">{m.org_role}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
          Invite a colleague
        </h2>
        <form
          action={inviteMember}
          className="bg-white border border-cl-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <label className="block flex-1">
            <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
              Role
            </span>
            <select
              name="org_role"
              defaultValue="buyer"
              className="px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy bg-white focus:outline-none focus:border-cl-teal/60"
            >
              <option value="buyer">Buyer</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light transition"
          >
            Send invite
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wider text-cl-gray-500 uppercase mb-3">
          Pending invitations ({invitations?.length ?? 0})
        </h2>
        {(invitations ?? []).length === 0 ? (
          <div className="bg-white border border-cl-gray-200 rounded-xl p-6 text-center text-cl-gray-500 text-sm">
            <Users className="w-8 h-8 text-cl-gray-300 mx-auto mb-2" />
            No pending invitations.
          </div>
        ) : (
          <ul className="space-y-2">
            {(invitations ?? []).map((inv) => (
              <li key={inv.id} className="bg-white border border-cl-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-cl-navy text-sm truncate">{inv.email}</div>
                    <div className="text-xs text-cl-gray-400">
                      {inv.org_role} · invited {formatDate(inv.created_at)}
                    </div>
                  </div>
                  <form action={revokeInvitation}>
                    <input type="hidden" name="invitation_id" value={inv.id} />
                    <button
                      type="submit"
                      className="text-xs text-cl-gray-500 hover:text-red-500"
                    >
                      Revoke
                    </button>
                  </form>
                </div>
                <div className="mt-2 text-xs text-cl-gray-500">
                  Invite link:{' '}
                  <span className="font-mono text-cl-teal break-all">/invite/{inv.token}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Banner({ tone, children }: { tone: 'ok' | 'err'; children: React.ReactNode }) {
  const cls =
    tone === 'ok'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : 'text-red-600 bg-red-50 border-red-200';
  return <p className={`mb-4 text-sm border rounded-lg px-3 py-2 ${cls}`}>{children}</p>;
}
