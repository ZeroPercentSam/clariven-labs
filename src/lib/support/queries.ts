import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/roles';

// Read layer for support tickets. RLS on support_tickets / ticket_messages
// (migration 0022) scopes every read to the caller's org (or all rows for a real
// admin) and filters internal notes from non-admins at the DB layer — these run
// on the authenticated SSR client, no service-role. Author identities are
// hydrated with a single bulk profiles lookup (mirrors lib/audit/queries.ts).

export type TicketSummary = {
  id: string;
  ticketNumber: number | null;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  orderId: string | null;
  organizationId: string;
  organizationName: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  lastMessageAt: string | null;
};

export type TicketMessage = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  authorIsStaff: boolean;
  isInternal: boolean;
};

export type TicketDetail = TicketSummary & {
  body: string;
  orderNumber: number | null;
  createdByUserId: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  messages: TicketMessage[];
};

export type AdminTicketCounts = {
  open: number;
  inProgress: number;
  resolved7d: number;
  oldestOpenDays: number | null;
};

const SUMMARY_COLUMNS = `
  id, ticket_number, subject, status, priority, category,
  created_at, updated_at, resolved_at,
  order_id, organization_id, created_by,
  organizations ( name ),
  ticket_messages ( created_at )
`;

type SupabaseInstance = Awaited<ReturnType<typeof createClient>>;

type ProfileLite = { email: string | null; full_name: string | null; role: string | null };

async function fetchProfileMap(
  supabase: SupabaseInstance,
  ids: string[],
): Promise<Map<string, ProfileLite>> {
  const map = new Map<string, ProfileLite>();
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return map;
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .in('id', unique);
  for (const p of data ?? []) {
    map.set(p.id, { email: p.email ?? null, full_name: p.full_name ?? null, role: p.role ?? null });
  }
  return map;
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

type RawSummaryRow = {
  id: string;
  ticket_number: number | null;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  order_id: string | null;
  organization_id: string;
  created_by: string | null;
  organizations: { name: string } | { name: string }[] | null;
  ticket_messages: { created_at: string }[] | null;
};

function lastMessageAt(rows: { created_at: string }[] | null): string | null {
  if (!rows || rows.length === 0) return null;
  return rows.map((m) => m.created_at).sort().reverse()[0];
}

// Hydrate the createdBy email/name across a page of summary rows in one lookup.
async function toSummaries(
  supabase: SupabaseInstance,
  rows: RawSummaryRow[],
): Promise<TicketSummary[]> {
  const profMap = await fetchProfileMap(
    supabase,
    rows.map((r) => r.created_by).filter((x): x is string => Boolean(x)),
  );
  return rows.map((r) => {
    const creator = r.created_by ? profMap.get(r.created_by) : null;
    return {
      id: r.id,
      ticketNumber: r.ticket_number,
      subject: r.subject,
      status: r.status,
      priority: r.priority,
      category: r.category,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      resolvedAt: r.resolved_at,
      orderId: r.order_id,
      organizationId: r.organization_id,
      organizationName: pickOne(r.organizations)?.name ?? null,
      createdByName: creator?.full_name ?? null,
      createdByEmail: creator?.email ?? null,
      lastMessageAt: lastMessageAt(r.ticket_messages),
    };
  });
}

/**
 * Customer-side list — tickets in the caller's org. RLS scopes the rows; we also
 * filter by the known org id for index use. Empty for unauth / no-org callers.
 */
export async function listOrgTickets(): Promise<TicketSummary[]> {
  const profile = await getProfile();
  if (!profile?.organization_id) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .select(SUMMARY_COLUMNS)
    .eq('organization_id', profile.organization_id)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return toSummaries(supabase, data as unknown as RawSummaryRow[]);
}

/**
 * Admin-side global list (up to 200 most-recently-updated). Optional status
 * filter is applied server-side; the chip island narrows further client-side.
 */
export async function listAdminTickets(filters: { status?: string } = {}): Promise<TicketSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from('support_tickets')
    .select(SUMMARY_COLUMNS)
    .order('updated_at', { ascending: false })
    .limit(200);
  if (filters.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error || !data) return [];
  return toSummaries(supabase, data as unknown as RawSummaryRow[]);
}

/** Admin KPI strip counts. Each is a head+exact count (never ships rows). */
export async function getAdminTicketCounts(): Promise<AdminTicketCounts> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [openRes, inProgRes, resolvedRes, oldestRes] = await Promise.all([
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('resolved_at', sevenDaysAgo),
    supabase
      .from('support_tickets')
      .select('created_at')
      .in('status', ['open', 'in_progress', 'waiting_customer'])
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  let oldestOpenDays: number | null = null;
  if (oldestRes.data?.created_at) {
    const ageMs = Date.now() - new Date(oldestRes.data.created_at).getTime();
    oldestOpenDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  }

  return {
    open: openRes.count ?? 0,
    inProgress: inProgRes.count ?? 0,
    resolved7d: resolvedRes.count ?? 0,
    oldestOpenDays,
  };
}

/**
 * One ticket + its message thread. Works for customer + admin — RLS scopes the
 * ticket and hides internal notes from non-admins. Returns null on cross-org or
 * missing.
 */
export async function getTicketWithMessages(ticketId: string): Promise<TicketDetail | null> {
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select(
      `
      id, ticket_number, subject, body, status, priority, category,
      created_at, updated_at, resolved_at,
      order_id, organization_id, created_by, assigned_to,
      orders ( order_number ),
      organizations ( name )
      `,
    )
    .eq('id', ticketId)
    .maybeSingle();
  if (error || !ticket) return null;

  const { data: messageRows, error: msgErr } = await supabase
    .from('ticket_messages')
    .select('id, body, created_at, author_id, is_internal')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (msgErr) return null;

  const ids: string[] = [];
  if (ticket.created_by) ids.push(ticket.created_by);
  if (ticket.assigned_to) ids.push(ticket.assigned_to);
  for (const m of messageRows ?? []) if (m.author_id) ids.push(m.author_id);
  const profMap = await fetchProfileMap(supabase, ids);

  const messages: TicketMessage[] = (messageRows ?? []).map((m) => {
    const author = m.author_id ? profMap.get(m.author_id) : null;
    return {
      id: m.id,
      body: m.body,
      createdAt: m.created_at,
      authorId: m.author_id,
      authorName: author?.full_name ?? null,
      authorEmail: author?.email ?? null,
      authorIsStaff: author?.role === 'admin',
      isInternal: Boolean(m.is_internal),
    };
  });

  const creator = ticket.created_by ? profMap.get(ticket.created_by) : null;
  const assignee = ticket.assigned_to ? profMap.get(ticket.assigned_to) : null;

  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    subject: ticket.subject,
    body: ticket.body,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    resolvedAt: ticket.resolved_at,
    orderId: ticket.order_id,
    orderNumber: pickOne(ticket.orders)?.order_number ?? null,
    organizationId: ticket.organization_id,
    organizationName: pickOne(ticket.organizations)?.name ?? null,
    createdByUserId: ticket.created_by,
    createdByName: creator?.full_name ?? null,
    createdByEmail: creator?.email ?? null,
    assignedTo: ticket.assigned_to,
    assignedToName: assignee?.full_name ?? assignee?.email ?? null,
    lastMessageAt: lastMessageAt((messageRows ?? []).map((m) => ({ created_at: m.created_at }))),
    messages,
  };
}

/** Customer's own orders, for the optional "link an order" dropdown on create. */
export async function listLinkableOrders(): Promise<
  Array<{ id: string; orderNumber: number; createdAt: string }>
> {
  const profile = await getProfile();
  if (!profile?.organization_id) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, created_at')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((o) => ({ id: o.id, orderNumber: o.order_number, createdAt: o.created_at }));
}
