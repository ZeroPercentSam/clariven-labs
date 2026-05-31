'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

const ALLOWED_MIME = new Set(['application/pdf']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function backWithError(message: string): never {
  redirect(`/onboarding/attest?error=${encodeURIComponent(message)}`);
}

/**
 * Self-service RUO onboarding. Creates the caller's organization (pending) via
 * bootstrap_organization, optionally stores a supporting PDF in the private
 * org-attestations bucket, and records the research-use attestation row. The
 * org starts `pending` → the approval gate (create_order_with_items) blocks
 * checkout until an admin approves it.
 *
 * Idempotent on re-entry: if the caller already has an org (e.g. a retry after
 * a partial submit), it reuses it rather than calling bootstrap_organization
 * (which refuses a second org).
 *
 * Env-resilience contract (#8): short-circuit before createClient() if env is
 * missing, so misconfig surfaces as an inline error instead of a 500.
 */
export async function submitAttestation(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) {
    backWithError("Can't reach the server right now. Try again shortly.");
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/onboarding/attest');

  const orgName = String(formData.get('org_name') ?? '').trim();
  const legalName = String(formData.get('legal_entity_name') ?? '').trim();
  const researchContext = String(formData.get('research_context') ?? '').trim();
  const affiliation = String(formData.get('institutional_affiliation') ?? '').trim() || null;
  const orcid = String(formData.get('orcid_or_inst_id') ?? '').trim() || null;
  const billingEmail = String(formData.get('billing_email') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;

  if (orgName.length < 2) backWithError('Organization name is required.');
  if (legalName.length < 2) backWithError('Legal entity name is required.');
  if (researchContext.length < 10) backWithError('Briefly describe your research context.');

  // Resolve or create the org.
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single();

  let orgId = profile?.organization_id ?? null;
  if (!orgId) {
    const { data: bootstrapped, error: bootErr } = await supabase.rpc('bootstrap_organization', {
      p_name: orgName,
      p_legal_name: legalName,
      p_billing_email: billingEmail ?? undefined,
      p_phone: phone ?? undefined,
    });
    if (bootErr || !bootstrapped) {
      backWithError(bootErr?.message ?? 'Could not create your organization.');
    }
    orgId = bootstrapped;
  }

  // Optional supporting PDF → private org-attestations bucket (path = org_id/…).
  let filePath: string | null = null;
  let fileName: string | null = null;
  let fileBytes: number | null = null;
  const file = formData.get('attestation_file');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) backWithError('Supporting document is over 20 MB.');
    if (!ALLOWED_MIME.has(file.type)) backWithError('Supporting document must be a PDF.');
    const safeName =
      file.name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) ||
      'attestation.pdf';
    const path = `${orgId}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from('org-attestations')
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (upErr) backWithError(`Upload failed: ${upErr.message}`);
    filePath = path;
    fileName = file.name.slice(0, 200);
    fileBytes = file.size;
  }

  const { error: insErr } = await supabase.from('org_attestations').insert({
    organization_id: orgId,
    legal_entity_name: legalName.slice(0, 200),
    research_context: researchContext.slice(0, 2000),
    institutional_affiliation: affiliation?.slice(0, 200) ?? null,
    orcid_or_inst_id: orcid?.slice(0, 100) ?? null,
    file_path: filePath,
    file_name: fileName,
    file_bytes: fileBytes,
  });
  if (insErr) {
    // Don't orphan an uploaded file if the row insert fails.
    if (filePath) {
      await supabase.storage.from('org-attestations').remove([filePath]).catch(() => {});
    }
    backWithError(insErr.message);
  }

  redirect('/onboarding/pending');
}
