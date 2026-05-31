'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { repOnboardingSchema, normalizeName, friendlyRepError } from '@/lib/rep/constants';

function inviteError(token: string, message: string): never {
  redirect(`/rep-invite/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`);
}
function onboardingError(message: string): never {
  redirect(`/rep/onboarding?error=${encodeURIComponent(message)}`);
}

/**
 * Direct-password signup from a rep invitation (portable-fix #2). The email is
 * taken from the invitation preview (NOT trusted from the form) and locked, so a
 * visitor can only create the exact invited account. With email verification on,
 * Supabase sends a confirmation link → /auth/callback?next=/rep-invite/<token>,
 * which lands the now-signed-in user back on the invite page to accept.
 */
export async function signUpRepFromInvite(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  if (!token) redirect('/login');
  if (!supabaseEnvConfigured()) inviteError(token, "Can't reach the server right now. Try again shortly.");
  if (password.length < 10) inviteError(token, 'Password must be at least 10 characters.');

  const supabase = await createClient();

  // Email comes from the invitation, never the form.
  const { data: previewRaw } = await supabase.rpc('get_rep_invitation_preview', { p_token: token });
  const preview = previewRaw as unknown as { email: string; status: string; is_expired: boolean } | null;
  if (!preview) inviteError(token, 'We could not find that invitation.');
  if (preview.status !== 'pending' || preview.is_expired) {
    inviteError(token, 'This invitation is no longer open.');
  }

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  const next = `/rep-invite/${encodeURIComponent(token)}`;

  const { data, error } = await supabase.auth.signUp({
    email: preview.email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.user) {
    inviteError(token, error?.message ?? 'Could not create the account.');
  }

  // Session present (email-verify off, e.g. local) → straight back to accept.
  // Otherwise show the check-your-email state on the invite page.
  if (data.session) {
    redirect(next);
  }
  redirect(`/rep-invite/${encodeURIComponent(token)}?signup=check_email`);
}

/** Accept a rep invitation: creates the sales_reps pending_invite shell. */
export async function acceptRepInvitation(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');
  if (!token) redirect('/login');
  if (!supabaseEnvConfigured()) inviteError(token, "Can't reach the server right now. Try again shortly.");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=/rep-invite/${encodeURIComponent(token)}`);

  const { error } = await supabase.rpc('accept_rep_invitation', { p_token: token });
  if (error) inviteError(token, friendlyRepError(error.message));

  revalidatePath('/rep', 'layout');
  redirect('/rep/onboarding');
}

/**
 * One-shot rep onboarding: validates the W-9/payout/address form, cross-checks
 * the typed e-signature against the legal name, records the agreement consent
 * (IP + UA), then stamps sales_reps with the data + flips status to
 * pending_review + sets onboarding_completed_at. The locked-columns trigger
 * permits exactly this transition while onboarding_completed_at is null.
 */
export async function submitRepOnboarding(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) onboardingError("Can't reach the server right now. Try again shortly.");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/rep/onboarding');
  const uid = auth.user.id;

  const parsed = repOnboardingSchema.safeParse({
    legalName: formData.get('legalName'),
    taxId: formData.get('taxId'),
    taxIdKind: formData.get('taxIdKind'),
    businessType: formData.get('businessType'),
    phone: formData.get('phone'),
    payoutMethod: formData.get('payoutMethod'),
    payoutAccountMasked: formData.get('payoutAccountMasked'),
    payoutAccountRef: formData.get('payoutAccountRef') ?? '',
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2') ?? '',
    addressCity: formData.get('addressCity'),
    addressState: formData.get('addressState'),
    addressPostalCode: formData.get('addressPostalCode'),
    addressCountry: formData.get('addressCountry') || 'US',
    signedLegalName: formData.get('signedLegalName'),
  });
  if (!parsed.success) {
    onboardingError('Fix the highlighted fields and try again.');
  }
  const v = parsed.data;

  if (String(formData.get('agreedToTerms') ?? '') !== 'on') {
    onboardingError('You must agree to the rep agreement to proceed.');
  }
  if (normalizeName(v.signedLegalName) !== normalizeName(v.legalName)) {
    onboardingError('Your signature must match the legal name you entered above.');
  }

  // One-shot guard: must be a rep that has not completed onboarding.
  const { data: rep } = await supabase
    .from('sales_reps')
    .select('status, onboarding_completed_at')
    .eq('id', uid)
    .maybeSingle();
  if (!rep) onboardingError('Your rep profile is missing. Contact support.');
  if (rep.onboarding_completed_at) redirect('/rep/onboarding/pending');

  const { data: agreement } = await supabase
    .from('rep_agreement_versions')
    .select('id')
    .is('retired_at', null)
    .maybeSingle();
  if (!agreement) onboardingError('No active rep agreement on file. Contact an admin.');

  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null;
  const userAgent = hdrs.get('user-agent') || null;

  // 1) Agreement consent — unique (rep_user_id, version_id) doubles as the
  //    double-submit idempotency guard (ignore 23505).
  const { error: consentErr } = await supabase.from('rep_agreement_consents').insert({
    rep_user_id: uid,
    version_id: agreement.id,
    signed_legal_name: v.signedLegalName,
    ip,
    user_agent: userAgent,
  });
  if (consentErr && consentErr.code !== '23505') {
    onboardingError(consentErr.message);
  }

  // 2) Stamp the rep + flip status. The locked-columns trigger allows these
  //    while old.onboarding_completed_at is null.
  const { error: updErr } = await supabase
    .from('sales_reps')
    .update({
      legal_name: v.legalName,
      tax_id: v.taxId,
      tax_id_kind: v.taxIdKind,
      business_type: v.businessType,
      payout_method: v.payoutMethod,
      payout_account_masked: v.payoutAccountMasked,
      payout_account_ref: v.payoutAccountRef || null,
      address_line1: v.addressLine1,
      address_line2: v.addressLine2 || null,
      address_city: v.addressCity,
      address_state: v.addressState,
      address_postal_code: v.addressPostalCode,
      address_country: v.addressCountry,
      phone: v.phone,
      status: 'pending_review',
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', uid);
  if (updErr) onboardingError(friendlyRepError(updErr.message));

  revalidatePath('/rep', 'layout');
  redirect('/rep/onboarding/pending');
}
