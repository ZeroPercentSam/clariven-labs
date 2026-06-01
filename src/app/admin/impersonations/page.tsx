import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/format-datetime';

export const metadata = { title: 'Impersonations — Admin' };
export const dynamic = 'force-dynamic';

type SessionRow = {
  id: string;
  admin_user_id: string;
  impersonated_user_id: string;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  ended_reason: string | null;
  justification: string;
};

function statusOf(s: SessionRow): string {
  if (!s.ended_at) return new Date(s.expires_at).getTime() > Date.now() ? 'active' : 'expired';
  return s.ended_reason ?? 'ended';
}

function durationMin(s: SessionRow): string {
  const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now();
  const ms = end - new Date(s.started_at).getTime();
  return `${Math.max(0, Math.round(ms / 60000))}m`;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-amber-100 text-amber-700',
  user_ended: 'bg-cl-gray-100 text-cl-gray-600',
  expired: 'bg-cl-gray-100 text-cl-gray-500',
  revoked: 'bg-red-100 text-red-700',
  ended: 'bg-cl-gray-100 text-cl-gray-600',
};

export default async function AdminImpersonationsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('impersonation_sessions')
    .select('id, admin_user_id, impersonated_user_id, started_at, expires_at, ended_at, ended_reason, justification')
    .order('started_at', { ascending: false })
    .limit(200);
  const rows = (sessions ?? []) as SessionRow[];

  const ids = Array.from(new Set(rows.flatMap((r) => [r.admin_user_id, r.impersonated_user_id])));
  const { data: profs } = ids.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', ids)
    : { data: [] };
  const byId = new Map((profs ?? []).map((p) => [p.id, p]));
  const who = (id: string) => {
    const p = byId.get(id);
    return p?.full_name || p?.email || id.slice(0, 8);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">Impersonations</h1>
      <p className="text-sm text-cl-gray-500 mb-6">
        Every admin-acts-as-customer session. Each action taken during a session is audited to the
        admin.
      </p>

      {rows.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No impersonation sessions yet.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cl-gray-50 text-cl-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2.5 whitespace-nowrap">Started</th>
                <th className="text-left px-3 py-2.5">Admin</th>
                <th className="text-left px-3 py-2.5">Acting as</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="text-right px-3 py-2.5">Duration</th>
                <th className="text-left px-3 py-2.5">Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {rows.map((s) => {
                const status = statusOf(s);
                return (
                  <tr key={s.id} className="align-top">
                    <td className="px-3 py-2.5 text-cl-gray-500 whitespace-nowrap">
                      {formatDateTime(s.started_at)}
                    </td>
                    <td className="px-3 py-2.5 text-cl-navy">{who(s.admin_user_id)}</td>
                    <td className="px-3 py-2.5 text-cl-navy">{who(s.impersonated_user_id)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[status] ?? 'bg-cl-gray-100 text-cl-gray-600'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-cl-gray-500 font-mono">{durationMin(s)}</td>
                    <td className="px-3 py-2.5 text-cl-gray-600 max-w-[280px]">{s.justification}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
