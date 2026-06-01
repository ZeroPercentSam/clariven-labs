import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminOrderPatchSchema } from '@/lib/schemas/admin';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { sendEmail } from '@/lib/email/send';
import { orderShippedEmail } from '@/lib/email/templates/order-shipped';
import { trackingUrl } from '@/lib/tracking';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const limited = await rateLimit(clientIp(req), { name: 'admin', limit: 30, windowSec: 60 });
  if (limited) return limited;
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = adminOrderPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const patch = parsed.data;
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('admin_audit_log').insert({
    actor_id: auth.user.id,
    action: 'order.patch',
    target_type: 'order',
    target_id: id,
    payload: patch,
  });

  // Branded "order shipped" email when an admin marks the order shipped.
  // Best-effort (invariant 7); the admin session can read the customer profile
  // via the is_admin() RLS clause, so no service-role client is needed.
  if (patch.status === 'shipped' && data) {
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', data.user_id)
        .single();
      if (prof?.email) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
        const link = trackingUrl(data.tracking_carrier, data.tracking_number);
        void sendEmail({
          to: prof.email,
          kind: 'order-shipped',
          ...orderShippedEmail({
            customerName: prof.full_name || prof.email,
            orderNumber: data.order_number,
            carrier: data.tracking_carrier || 'Carrier',
            trackingNumber: data.tracking_number || '',
            trackingUrl: link?.url ?? null,
            ctaUrl: `${siteUrl}/portal/orders/${id}`,
          }),
        });
      }
    } catch (e) {
      console.warn('[admin:order-shipped-email]', {
        orderId: id,
        err: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ ok: true, order: data });
}
