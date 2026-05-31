import { createClient } from '@/lib/supabase/server';

// Read layer for the /admin/audit viewer. SELECT on admin_audit_log is
// admin-only at the RLS layer (audit_admin_read → is_admin()), so these run on
// the authenticated SSR client — no service-role. Pages calling these must
// still requireAdmin() for the friendly redirect; RLS is the hard boundary.

export type AuditEvent = {
  id: string;
  created_at: string;
  action: string;
  target_type: string;
  target_id: string;
  actor_id: string;
  actor_email: string | null;
  actor_name: string | null;
  payload: Record<string, unknown> | null;
};

export type AuditFilters = {
  targetType?: string;
  action?: string;
  from?: string; // ISO timestamp, inclusive lower bound on created_at
  to?: string; // ISO timestamp, inclusive upper bound on created_at
  limit?: number;
};

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 5000;

type Row = {
  id: string;
  created_at: string;
  action: string;
  target_type: string;
  target_id: string;
  actor_id: string;
  payload: unknown;
};

// Apply the shared filter predicates. Typed loosely because the Supabase
// query-builder generic narrows on each call and we reuse it for list + count.
function applyFilters<T extends { eq: (c: string, v: string) => T; gte: (c: string, v: string) => T; lte: (c: string, v: string) => T }>(
  query: T,
  f: AuditFilters,
): T {
  let q = query;
  if (f.targetType) q = q.eq('target_type', f.targetType);
  if (f.action) q = q.eq('action', f.action);
  if (f.from) q = q.gte('created_at', f.from);
  if (f.to) q = q.lte('created_at', f.to);
  return q;
}

function normalizePayload(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

// Total count matching the filters (for the "showing N of M" header). Uses a
// head+exact count so it never ships rows.
export async function countAuditEvents(filters: AuditFilters = {}): Promise<number> {
  const supabase = await createClient();
  const base = supabase.from('admin_audit_log').select('id', { count: 'exact', head: true });
  const { count } = await applyFilters(base, filters);
  return count ?? 0;
}

// Most-recent-first audit events, hydrated with the actor's email + name via a
// single bulk profiles lookup (mirrors the commissions ledger's rep hydrate).
export async function listAuditEvents(filters: AuditFilters = {}): Promise<AuditEvent[]> {
  const supabase = await createClient();
  const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const base = supabase
    .from('admin_audit_log')
    .select('id, created_at, action, target_type, target_id, actor_id, payload')
    .order('created_at', { ascending: false })
    .limit(limit);
  const { data, error } = await applyFilters(base, filters);
  if (error || !data) return [];
  const rows = data as Row[];

  const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean)));
  const actorMap = new Map<string, { email: string | null; full_name: string | null }>();
  if (actorIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', actorIds);
    for (const p of profiles ?? []) {
      actorMap.set(p.id, { email: p.email ?? null, full_name: p.full_name ?? null });
    }
  }

  return rows.map((r) => {
    const actor = actorMap.get(r.actor_id);
    return {
      id: r.id,
      created_at: r.created_at,
      action: r.action,
      target_type: r.target_type,
      target_id: r.target_id,
      actor_id: r.actor_id,
      actor_email: actor?.email ?? null,
      actor_name: actor?.full_name ?? null,
      payload: normalizePayload(r.payload),
    };
  });
}
