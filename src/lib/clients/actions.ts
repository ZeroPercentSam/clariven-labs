'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { provisionAuthUser, deleteAuthUser } from '@/lib/clients/provision';
import {
  CreateClientSchema,
  AddMemberSchema,
  ToggleItemSchema,
  EngagementStatusSchema,
  friendlyClientError,
  type ActionResult,
  type CreateClientResult,
} from '@/lib/clients/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Provision a client login. New client → creates the company org + first user
// (owner) + seeds the onboarding checklist. Existing client (orgId set) → adds
// another member, no re-seed. Returns the generated password ONCE for the admin
// to relay. requireAdmin() gates BEFORE the service-role admin API is touched.
// ─────────────────────────────────────────────────────────────────────────────
export async function createClientAccount(input: {
  orgId?: string;
  orgName?: string;
  legalName?: string;
  email: string;
  fullName: string;
  orgRole?: string;
}): Promise<CreateClientResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: 'Account provisioning is unavailable on this environment.' };
  }
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin access is required.' };
  }

  const isExisting = Boolean(input.orgId);

  // Validate + build the RPC args for the right path (new client vs add member).
  let email: string;
  let fullName: string;
  let rpcArgs: {
    p_user_id: string;
    p_org_id?: string;
    p_name?: string;
    p_legal_name?: string;
    p_full_name: string;
    p_org_role: string;
  };

  if (isExisting) {
    const parsed = AddMemberSchema.safeParse({ ...input, orgRole: input.orgRole ?? 'buyer' });
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    email = parsed.data.email;
    fullName = parsed.data.fullName;
    rpcArgs = {
      p_user_id: '', // filled after the auth user is created
      p_org_id: parsed.data.orgId,
      p_full_name: parsed.data.fullName,
      p_org_role: parsed.data.orgRole,
    };
  } else {
    const parsed = CreateClientSchema.safeParse({ ...input, orgRole: input.orgRole ?? 'owner' });
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    email = parsed.data.email;
    fullName = parsed.data.fullName;
    rpcArgs = {
      p_user_id: '',
      p_name: parsed.data.orgName,
      p_legal_name: parsed.data.legalName || undefined,
      p_full_name: parsed.data.fullName,
      p_org_role: parsed.data.orgRole,
    };
  }

  // 1. auth user with a generated password (service-role, gated above)
  const prov = await provisionAuthUser({ email, fullName });
  if (!prov.ok) return { ok: false, error: prov.error };

  const supabase = await createClient();

  // 2. link profile → org + membership (definer RPC, real-admin gated)
  rpcArgs.p_user_id = prov.userId;
  const { data: orgId, error: provErr } = await supabase.rpc('provision_client_member', rpcArgs);
  if (provErr || !orgId) {
    await deleteAuthUser(prov.userId); // roll back the orphan auth user
    return { ok: false, error: friendlyClientError(provErr?.message) };
  }

  // 3. seed the checklist for a brand-new client
  let warning: string | undefined;
  if (!isExisting) {
    const { error: seedErr } = await supabase.rpc('start_client_onboarding', { p_org_id: orgId });
    if (seedErr) warning = `Account created, but the checklist did not seed: ${seedErr.message}`;
  }

  revalidatePath('/admin/clients');
  if (orgId) revalidatePath(`/admin/clients/${orgId}`);
  return { ok: true, orgId, email, tempPassword: prov.password, warning };
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle one onboarding item. NO requireAdmin — RLS (cis_update) lets any member
// of the org OR an admin write; the trigger stamps done_by/done_at. Called from
// the checklist island (admin detail + client portal) via useTransition.
// ─────────────────────────────────────────────────────────────────────────────
export async function toggleItem(input: {
  orgId: string;
  itemId: number;
  status: string;
}): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'unavailable' };
  const parsed = ToggleItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid request.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('client_item_status')
    .update({ status: parsed.data.status })
    .eq('organization_id', parsed.data.orgId)
    .eq('item_id', parsed.data.itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/portal/onboarding');
  revalidatePath(`/admin/clients/${parsed.data.orgId}`);
  revalidatePath('/admin/clients');
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin sets the engagement status (onboarding / launch_ready / live / paused).
// Stamps launched_at when first moved to 'live'. FormData → redirect idiom.
// ─────────────────────────────────────────────────────────────────────────────
export async function setEngagementStatus(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/clients?error=unavailable');
  await requireAdmin();
  const orgId = String(formData.get('org_id') ?? '');
  const status = String(formData.get('status') ?? '');
  const parsed = EngagementStatusSchema.safeParse({ orgId, status });
  if (!parsed.success) redirect(`/admin/clients/${orgId}?error=status`);

  const supabase = await createClient();
  const patch: { status: string; launched_at?: string } = { status: parsed.data.status };
  if (parsed.data.status === 'live') patch.launched_at = new Date().toISOString();
  const { error } = await supabase
    .from('client_onboarding')
    .update(patch)
    .eq('organization_id', parsed.data.orgId);
  if (error) redirect(`/admin/clients/${parsed.data.orgId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/admin/clients/${parsed.data.orgId}`);
  revalidatePath('/admin/clients');
  redirect(`/admin/clients/${parsed.data.orgId}?ok=status`);
}

// Admin seeds (or back-fills) the checklist for a client whose onboarding never
// started — e.g. an org created before this feature.
export async function startOnboarding(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) redirect('/admin/clients?error=unavailable');
  await requireAdmin();
  const orgId = String(formData.get('org_id') ?? '');
  if (!orgId) redirect('/admin/clients?error=missing');
  const supabase = await createClient();
  const { error } = await supabase.rpc('start_client_onboarding', { p_org_id: orgId });
  if (error) redirect(`/admin/clients/${orgId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/clients/${orgId}`);
  redirect(`/admin/clients/${orgId}?ok=started`);
}
