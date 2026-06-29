'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { checkRateLimit } from '@/lib/ratelimit';
import { sendEmail } from '@/lib/email/send';
import { membershipStaffNotifyEmail } from '@/lib/email/templates/membership-staff-notify';
import { membershipWelcomeEmail } from '@/lib/email/templates/membership-welcome';
import { membershipWireEmail } from '@/lib/email/templates/membership-wire-instructions';
import { sendAgreement } from '@/lib/integrations/docusign';
import { INITIAL_ENGAGEMENT_FEE_CENTS } from '@/lib/memberships/constants';
import { wireFromEnv } from '@/lib/memberships/wire';

// Public "apply to become a client" handler. Trust boundary (unauthenticated):
// honeypot + validation + rate-limit, then persist via the SECURITY DEFINER
// anon RPC (submit_membership_request — the row is the system of record), then
// best-effort follow-ups (staff notify, welcome, wire instructions, agreement).
// Follow-ups never roll back the captured request (invariant #6).

export type MembershipState = { ok: boolean; error?: string; bookingUrl?: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function submitMembershipRequest(
  _prev: MembershipState,
  formData: FormData,
): Promise<MembershipState> {
  const bookingUrl = process.env.BOOKING_URL?.trim() || '';

  // Honeypot: bots fill the hidden field → silent success, send nothing.
  if (String(formData.get('company_website') ?? '').trim()) return { ok: true, bookingUrl };

  const get = (k: string) => String(formData.get(k) ?? '').trim().slice(0, 2000);
  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const brand = get('brand');
  const message = get('message');

  if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: 'We can’t reach the server right now. Please email support@clarivenlabs.com.' };
  }

  // Per-IP rate limit (no-op until Upstash configured; fails open).
  const hdrs = await headers();
  const ip = (hdrs.get('x-forwarded-for')?.split(',')[0] ?? hdrs.get('x-real-ip') ?? 'unknown').trim();
  const rl = await checkRateLimit(`membership:${ip}`, { name: 'membership', limit: 5, windowSec: 3600 });
  if (!rl.ok) {
    return { ok: false, error: 'Too many requests — try again later, or email support@clarivenlabs.com.' };
  }

  // Persist first (reliable capture) via the definer anon writer.
  const supabase = await createClient();
  const { data: requestId, error } = await supabase.rpc('submit_membership_request', {
    p_full_name: name,
    p_email: email,
    p_phone: phone || undefined,
    p_proposed_brand: brand || undefined,
    p_message: message || undefined,
    p_source: 'apply-form',
  });
  if (error) {
    return { ok: false, error: 'Could not submit right now. Please email support@clarivenlabs.com directly.' };
  }

  // Best-effort follow-ups — none of these roll back the captured request.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clarivenlabs.com';
  const adminUrl = `${siteUrl}/admin/memberships${requestId ? `/${requestId}` : ''}`;
  const staffTo =
    process.env.MEMBERSHIP_NOTIFY_EMAIL || process.env.LEAD_NOTIFY_EMAIL || 'support@clarivenlabs.com';

  try {
    const t = membershipStaffNotifyEmail({ name, email, phone, brand, message, adminUrl });
    await sendEmail({ to: staffTo, subject: t.subject, html: t.html, text: t.text, kind: 'membership-staff-notify' });
  } catch (e) {
    console.warn('[membership] staff notify failed', e);
  }

  try {
    const t = membershipWelcomeEmail({ name, bookingUrl, initialFeeCents: INITIAL_ENGAGEMENT_FEE_CENTS });
    await sendEmail({ to: email, subject: t.subject, html: t.html, text: t.text, kind: 'membership-welcome' });
  } catch (e) {
    console.warn('[membership] welcome failed', e);
  }

  const wire = wireFromEnv(brand ? `Clariven — ${brand}` : `Clariven — ${name}`);
  if (wire) {
    try {
      const t = membershipWireEmail({ name, amountCents: INITIAL_ENGAGEMENT_FEE_CENTS, wire });
      await sendEmail({ to: email, subject: t.subject, html: t.html, text: t.text, kind: 'membership-wire-instructions' });
    } catch (e) {
      console.warn('[membership] wire failed', e);
    }
  }

  try {
    await sendAgreement({ toEmail: email, toName: name, agreement: 'consulting' });
  } catch (e) {
    console.warn('[membership] agreement send failed', e);
  }

  return { ok: true, bookingUrl };
}
