'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { sendEmail } from '@/lib/email/send';
import { membershipSignedEmail } from '@/lib/email/templates/membership-signed';
import { membershipWireEmail } from '@/lib/email/templates/membership-wire-instructions';
import { wireFromEnv } from '@/lib/memberships/wire';
import { INITIAL_ENGAGEMENT_FEE_CENTS } from '@/lib/memberships/constants';

// In-app e-signature for a client agreement (consulting / brokering). Mirrors
// the rep ICA consent flow: the typed legal name is the signature, IP + UA are
// captured, one consent per (org, version). Idempotent on the unique violation.
export type SignState = { ok: boolean; error?: string };

export async function signAgreement(_prev: SignState, formData: FormData): Promise<SignState> {
  const slug = String(formData.get('slug') ?? '').trim();
  const signedName = String(formData.get('signed_legal_name') ?? '').trim().slice(0, 200);
  const agreed = String(formData.get('agree') ?? '') === 'on';

  if (!supabaseEnvConfigured()) return { ok: false, error: "Can't reach the server right now. Try again shortly." };
  if (!slug) return { ok: false, error: 'Missing agreement.' };
  if (signedName.length < 2) return { ok: false, error: 'Type your full legal name to sign.' };
  if (!agreed) return { ok: false, error: 'You must check the box to agree.' };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: 'Please sign in again.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .maybeSingle();
  const orgId = profile?.organization_id;
  if (!orgId) return { ok: false, error: 'No organization on your account.' };

  const { data: ver } = await supabase
    .from('client_agreements')
    .select('id')
    .eq('slug', slug)
    .is('retired_at', null)
    .maybeSingle();
  if (!ver) return { ok: false, error: 'That agreement is not available right now.' };

  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null;
  const userAgent = hdrs.get('user-agent') || null;

  const { error } = await supabase.from('client_agreement_consents').insert({
    organization_id: orgId,
    user_id: auth.user.id,
    version_id: ver.id,
    signed_legal_name: signedName,
    ip,
    user_agent: userAgent,
  });
  // 23505 = already signed this version → treat as success (idempotent).
  if (error && error.code !== '23505') return { ok: false, error: error.message };

  // First-time consulting signature → notify the team ("once signed, notify all
  // three") + send wire instructions to the client. Best-effort: a send failure
  // never rolls back the recorded consent (invariant #6).
  if (!error && slug === 'consulting') {
    try {
      const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).maybeSingle();
      const orgName = org?.name ?? 'a client';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clarivenlabs.com';
      const staffTo =
        process.env.MEMBERSHIP_NOTIFY_EMAIL || process.env.LEAD_NOTIFY_EMAIL || 'support@clarivenlabs.com';

      const notify = membershipSignedEmail({ orgName, clientName: signedName, adminUrl: `${siteUrl}/admin/clients` });
      await sendEmail({ to: staffTo, subject: notify.subject, html: notify.html, text: notify.text, kind: 'membership-signed' });

      const wire = wireFromEnv(`Clariven — ${orgName}`);
      const clientEmail = auth.user.email;
      if (wire && clientEmail) {
        const w = membershipWireEmail({ name: signedName, amountCents: INITIAL_ENGAGEMENT_FEE_CENTS, wire });
        await sendEmail({ to: clientEmail, subject: w.subject, html: w.html, text: w.text, kind: 'membership-wire-instructions' });
      }
    } catch (e) {
      console.warn('[agreement] post-sign notify failed', e);
    }
  }

  revalidatePath('/portal/onboarding');
  return { ok: true };
}
