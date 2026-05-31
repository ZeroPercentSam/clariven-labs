import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/format-datetime';
import {
  EMAIL_LOG_STATUS_FILTERS,
  EMAIL_LOG_KIND_LABELS,
  type EmailKind,
} from '@/lib/email/log-constants';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  suppressed: 'bg-cl-gray-100 text-cl-gray-600 border-cl-gray-200',
};

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-cl-gray-100 text-cl-gray-600 border-cl-gray-200';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

export default async function AdminEmailLog({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  // KPI strip — last 7 days.
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('email_log')
    .select('status')
    .gte('created_at', sevenDaysAgo)
    .limit(5000);
  const counts = { sent: 0, error: 0, suppressed: 0 } as Record<string, number>;
  for (const r of recent ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const total = (counts.sent ?? 0) + (counts.error ?? 0) + (counts.suppressed ?? 0);
  const successRate = total ? Math.round(((counts.sent ?? 0) / total) * 100) : null;

  // Table — most recent 200, filtered.
  let query = supabase
    .from('email_log')
    .select('id, created_at, kind, status, to_address, subject, error')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('to_address', `%${q}%`);
  const { data: rows } = await query;

  const kpis = [
    { label: 'Sent (7d)', value: String(counts.sent ?? 0) },
    { label: 'Errors (7d)', value: String(counts.error ?? 0) },
    { label: 'Suppressed (7d)', value: String(counts.suppressed ?? 0) },
    { label: 'Success rate', value: successRate == null ? '—' : `${successRate}%` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-cl-navy">Email log</h1>
        <form className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={status ?? 'all'}
            className="px-3 py-1.5 rounded-lg border border-cl-gray-200 text-sm bg-white"
          >
            {EMAIL_LOG_STATUS_FILTERS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Recipient email"
            className="px-3 py-1.5 rounded-lg border border-cl-gray-200 text-sm bg-white"
          />
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-cl-navy text-white text-sm">
            Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-cl-gray-200 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-cl-gray-400">
              {k.label}
            </p>
            <p className="text-xl font-bold text-cl-navy mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-cl-gray-200 overflow-hidden">
        {!rows || rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">
            No email events match.
          </p>
        ) : (
          <ul className="divide-y divide-cl-gray-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-5 py-3 text-sm">
                <div className="w-44 shrink-0 text-xs text-cl-gray-500">
                  {formatDateTime(r.created_at)}
                </div>
                <div className="w-32 shrink-0 text-cl-navy font-medium">
                  {EMAIL_LOG_KIND_LABELS[r.kind as EmailKind] ?? r.kind}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cl-navy truncate">{r.to_address}</p>
                  {r.subject ? (
                    <p className="text-xs text-cl-gray-500 truncate">{r.subject}</p>
                  ) : null}
                  {r.error ? (
                    <p className="text-xs text-red-600 truncate mt-0.5">{r.error}</p>
                  ) : null}
                </div>
                <div className="shrink-0">
                  <StatusPill status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
