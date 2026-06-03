'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getSessionUser, requireAdmin } from '@/lib/auth/roles';
import { requireActiveRep } from '@/lib/rep/portal-queries';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { ticketCreateSchema, ticketReplySchema } from '@/lib/schemas/support';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/support/constants';
import type { Json } from '@/lib/database.types';

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// Inline audit helper (mirrors lib/rep/admin-actions.ts). Only the admin triage
// actions write here — customer create/reply are not admin mutations (and the
// admin_audit_log RLS is admin-write anyway).
async function audit(
  actorId: string,
  action: string,
  targetId: string,
  payload: Json = {},
) {
  const supabase = await createClient();
  await supabase.from('admin_audit_log').insert({
    actor_id: actorId,
    action,
    target_type: 'support_ticket',
    target_id: targetId,
    payload,
  });
}

/**
 * Customer-side ticket creation. RLS (tkt_ins) blocks cross-org writes; we also
 * pre-check the optional linked order belongs to the caller's org. On success
 * we redirect to the new ticket. ticket_number is DB-assigned (identity).
 */
export async function createTicket(formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: "Can't reach the data service right now. Try again shortly." };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, error: 'Sign in to open a ticket.' };
  const profile = await getProfile();
  if (!profile?.organization_id) {
    return { ok: false, error: 'Your account is not linked to an organization yet.' };
  }

  const parsed = ticketCreateSchema.safeParse({
    subject: formData.get('subject')?.toString() ?? '',
    body: formData.get('body')?.toString() ?? '',
    category: formData.get('category')?.toString() || undefined,
    order_id: formData.get('order_id')?.toString() ?? '',
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Check the form for errors.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const orderId = parsed.data.order_id ?? null;
  if (orderId) {
    // RLS already scopes orders to the caller's org; this is defense in depth.
    const { data: orderCheck } = await supabase
      .from('orders')
      .select('id, organization_id')
      .eq('id', orderId)
      .maybeSingle();
    if (!orderCheck) return { ok: false, error: 'Linked order not found.' };
    if (orderCheck.organization_id !== profile.organization_id) {
      return { ok: false, error: 'Linked order is not in your organization.' };
    }
  }

  const { data: inserted, error: insErr } = await supabase
    .from('support_tickets')
    .insert({
      organization_id: profile.organization_id,
      created_by: user.id,
      subject: parsed.data.subject,
      body: parsed.data.body,
      category: parsed.data.category ?? null,
      order_id: orderId,
      status: 'open',
      priority: 'normal',
    })
    .select('id')
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? 'Could not create the ticket.' };
  }

  revalidatePath('/portal/support');
  revalidatePath('/admin/support');
  redirect(`/portal/support/${inserted.id}`);
}

/**
 * Rep-side ticket creation. A rep has no org, so the ticket is org-less
 * (organization_id null, created_by = rep id). The 0025 tkt_ins RLS only allows
 * this org-null insert for an active rep; requireActiveRep is defense in depth +
 * gives us the rep id. No order link (reps don't own org orders).
 */
export async function createRepTicket(formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: "Can't reach the data service right now. Try again shortly." };
  }

  const rep = await requireActiveRep(); // redirects if not an active rep

  const parsed = ticketCreateSchema.safeParse({
    subject: formData.get('subject')?.toString() ?? '',
    body: formData.get('body')?.toString() ?? '',
    category: formData.get('category')?.toString() || undefined,
    order_id: '', // reps never link an order
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Check the form for errors.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { data: inserted, error: insErr } = await supabase
    .from('support_tickets')
    .insert({
      organization_id: null,
      created_by: rep.id,
      subject: parsed.data.subject,
      body: parsed.data.body,
      category: parsed.data.category ?? null,
      order_id: null,
      status: 'open',
      priority: 'normal',
    })
    .select('id')
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? 'Could not create the ticket.' };
  }

  revalidatePath('/rep/support');
  revalidatePath('/admin/support');
  redirect(`/rep/support/${inserted.id}`);
}

/**
 * Post a reply. Both customer + admin use this. is_internal is honored only when
 * the caller is a real admin (also enforced by the tmsg_ins RLS). The reopen +
 * updated_at re-sort are handled by the ticket_reopen_on_reply trigger.
 */
export async function replyToTicket(ticketId: string, formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: "Can't reach the data service right now. Try again shortly." };
  }
  if (!ticketId) return { ok: false, error: 'Missing ticket.' };

  const user = await getSessionUser();
  if (!user) return { ok: false, error: 'Sign in to reply.' };

  const parsed = ticketReplySchema.safeParse({
    body: formData.get('body')?.toString() ?? '',
    is_internal: formData.get('is_internal') ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Check the form for errors.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Only a real admin may post an internal note.
  let isAdmin = false;
  try {
    await requireAdmin();
    isAdmin = true;
  } catch {
    isAdmin = false;
  }
  const isInternal = isAdmin ? parsed.data.is_internal : false;

  const supabase = await createClient();
  const { error: msgErr } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    author_id: user.id,
    body: parsed.data.body,
    is_internal: isInternal,
  });
  if (msgErr) return { ok: false, error: msgErr.message };

  revalidatePath(`/portal/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath(`/rep/support/${ticketId}`);
  revalidatePath('/portal/support');
  revalidatePath('/admin/support');
  revalidatePath('/rep/support');
  return { ok: true };
}

/** Admin-only: change ticket status. Stamps resolved_at when resolving/closing. */
export async function setTicketStatus(ticketId: string, status: string): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'Data service unavailable.' };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!(TICKET_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: `Unknown status: ${status}` };
  }

  const supabase = await createClient();
  const isClosed = status === 'resolved' || status === 'closed';
  const { error } = await supabase
    .from('support_tickets')
    .update({ status, resolved_at: isClosed ? new Date().toISOString() : null })
    .eq('id', ticketId);
  if (error) return { ok: false, error: error.message };

  await audit(admin.id, 'support_ticket.status', ticketId, { status });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath(`/portal/support/${ticketId}`);
  revalidatePath('/admin/support');
  revalidatePath('/portal/support');
  return { ok: true };
}

/** Admin-only: change ticket priority. */
export async function setTicketPriority(ticketId: string, priority: string): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'Data service unavailable.' };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!(TICKET_PRIORITIES as readonly string[]).includes(priority)) {
    return { ok: false, error: `Unknown priority: ${priority}` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('support_tickets')
    .update({ priority })
    .eq('id', ticketId);
  if (error) return { ok: false, error: error.message };

  await audit(admin.id, 'support_ticket.priority', ticketId, { priority });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath('/admin/support');
  return { ok: true };
}

/** Admin-only: claim a ticket (assign to self) and move it into in_progress. */
export async function assignTicketToMe(ticketId: string): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'Data service unavailable.' };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('support_tickets')
    .update({ assigned_to: admin.id, status: 'in_progress' })
    .eq('id', ticketId)
    .in('status', ['open', 'waiting_customer', 'in_progress']);
  if (error) return { ok: false, error: error.message };

  await audit(admin.id, 'support_ticket.assigned', ticketId, { assigned_to: admin.id });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath('/admin/support');
  return { ok: true };
}
