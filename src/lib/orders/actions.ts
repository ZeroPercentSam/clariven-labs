'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { orderRequestEmail } from '@/lib/email/templates/order-request';
import { ORDER_REQUEST_KIND_LABELS } from './constants';

export type OrderRequestState = { ok: boolean; error?: string; requestId?: string };

type RawItem = { product_slug?: unknown; strength_label?: unknown; quantity?: unknown };

// Client submits a product selection (initial) or reorder. The picker posts a
// JSON `items` array; we sanitize, then the definer RPC validates SKUs + writes
// atomically. Email is best-effort (client is authenticated, so it logs).
export async function submitOrderRequest(
  _prev: OrderRequestState,
  formData: FormData,
): Promise<OrderRequestState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: 'Please sign in.' };

  const kind = String(formData.get('kind') ?? 'reorder') === 'initial' ? 'initial' : 'reorder';
  const note = String(formData.get('note') ?? '').trim().slice(0, 2000);

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    return { ok: false, error: 'Invalid selection.' };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, error: 'Select at least one product.' };
  }
  const items = parsed
    .slice(0, 100)
    .map((it: RawItem) => ({
      product_slug: String(it.product_slug ?? '').trim(),
      strength_label: String(it.strength_label ?? '').trim(),
      quantity: Math.max(1, Math.min(999, Math.trunc(Number(it.quantity)) || 1)),
    }))
    .filter((it) => it.product_slug && it.strength_label);
  if (items.length === 0) return { ok: false, error: 'Select at least one product.' };

  const { data: requestId, error } = await supabase.rpc('submit_order_request', {
    p_items: items,
    p_kind: kind,
    p_note: note || undefined,
  });
  if (error) return { ok: false, error: 'Could not submit your request. Please try again.' };

  // Best-effort notifications (authenticated context → these log to email_log).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clarivenlabs.com';
  const kindLabel = ORDER_REQUEST_KIND_LABELS[kind];
  const staffTo =
    process.env.MEMBERSHIP_NOTIFY_EMAIL || process.env.LEAD_NOTIFY_EMAIL || 'support@clarivenlabs.com';

  try {
    const t = orderRequestEmail({
      heading: 'New order request',
      intro: 'A client submitted an order request.',
      itemCount: items.length,
      kindLabel,
      ctaLabel: 'Review in admin',
      ctaUrl: `${siteUrl}/admin/orders/${requestId}`,
    });
    await sendEmail({ to: staffTo, subject: t.subject, html: t.html, text: t.text, kind: 'order-request' });
  } catch (e) {
    console.warn('[order-request] staff notify failed', e);
  }
  if (auth.user.email) {
    try {
      const t = orderRequestEmail({
        heading: 'We received your request',
        intro: 'Thanks — we have your order request and will review it shortly.',
        itemCount: items.length,
        kindLabel,
        ctaLabel: 'View request',
        ctaUrl: `${siteUrl}/portal/orders/${requestId}`,
      });
      await sendEmail({ to: auth.user.email, subject: t.subject, html: t.html, text: t.text, kind: 'order-request' });
    } catch (e) {
      console.warn('[order-request] client confirm failed', e);
    }
  }

  revalidatePath('/portal/orders');
  return { ok: true, requestId: requestId as string };
}
