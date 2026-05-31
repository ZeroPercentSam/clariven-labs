import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/roles';
import { listAuditEvents, countAuditEvents, type AuditEvent } from '@/lib/audit/queries';
import { AUDIT_TARGET_TYPES, auditTargetLabel } from '@/lib/audit/constants';
import { formatDateTime } from '@/lib/format-datetime';

export const metadata = { title: 'Audit log — Admin' };
export const dynamic = 'force-dynamic';

const LIMIT = 200;

// Render a jsonb payload as a compact key:value list. Each value is stringified
// and truncated so a long notes_internal can't blow out the row.
function PayloadCell({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return <span className="text-cl-gray-300">—</span>;
  const entries = Object.entries(payload);
  if (entries.length === 0) return <span className="text-cl-gray-300">—</span>;
  return (
    <ul className="space-y-0.5">
      {entries.map(([k, v]) => {
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        const shown = s.length > 80 ? `${s.slice(0, 80)}…` : s;
        return (
          <li key={k} className="text-[11px] leading-snug">
            <span className="text-cl-gray-400">{k}:</span>{' '}
            <span className="text-cl-navy break-all">{shown}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  await requireAdmin();
  const { target: targetParam } = await searchParams;
  const targetType = (AUDIT_TARGET_TYPES as readonly string[]).includes(targetParam ?? '')
    ? (targetParam as string)
    : undefined;

  const filters = { targetType, limit: LIMIT };
  const [events, total]: [AuditEvent[], number] = await Promise.all([
    listAuditEvents(filters),
    countAuditEvents({ targetType }),
  ]);

  const exportHref = targetType ? `/admin/audit/export?target=${targetType}` : '/admin/audit/export';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Audit log</h1>
        <a
          href={exportHref}
          className="text-xs px-3 py-2 rounded-lg border border-cl-gray-200 text-cl-navy hover:bg-white"
        >
          Export CSV
        </a>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        <Link
          href="/admin/audit"
          className={`text-xs px-3 py-1.5 rounded-full ${
            !targetType ? 'bg-cl-navy text-white' : 'bg-white border border-cl-gray-200 text-cl-navy'
          }`}
        >
          All
        </Link>
        {AUDIT_TARGET_TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/audit?target=${t}`}
            className={`text-xs px-3 py-1.5 rounded-full ${
              targetType === t ? 'bg-cl-navy text-white' : 'bg-white border border-cl-gray-200 text-cl-navy'
            }`}
          >
            {auditTargetLabel(t)}
          </Link>
        ))}
      </div>

      <p className="text-xs text-cl-gray-400 mb-2">
        {total} event{total === 1 ? '' : 's'}
        {targetType ? ` · ${auditTargetLabel(targetType)}` : ''}
        {total > LIMIT ? ` · showing ${LIMIT} most recent` : ''}
      </p>

      {events.length === 0 ? (
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center text-cl-gray-500 text-sm">
          No audit events.
        </div>
      ) : (
        <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cl-gray-50 text-cl-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2.5 whitespace-nowrap">When</th>
                <th className="text-left px-3 py-2.5">Action</th>
                <th className="text-left px-3 py-2.5">Target</th>
                <th className="text-left px-3 py-2.5">Actor</th>
                <th className="text-left px-3 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-gray-100">
              {events.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="px-3 py-2.5 text-cl-gray-500 whitespace-nowrap">
                    {formatDateTime(e.created_at)}
                  </td>
                  <td className="px-3 py-2.5 text-cl-navy font-mono text-xs">{e.action}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-cl-navy">{auditTargetLabel(e.target_type)}</span>
                    <span className="block text-[11px] text-cl-gray-400 font-mono break-all">
                      {e.target_id}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-cl-navy">{e.actor_name ?? '—'}</span>
                    <span className="block text-[11px] text-cl-gray-400 break-all">
                      {e.actor_email ?? e.actor_id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 max-w-[280px]">
                    <PayloadCell payload={e.payload} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
