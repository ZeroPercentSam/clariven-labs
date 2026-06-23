'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type IntakeState = { ok: boolean; error?: string };

// Resolve the caller's org server-side — never trust an org id from the client.
async function resolveOrgId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .maybeSingle();
  return profile?.organization_id ?? null;
}

function str(formData: FormData, key: string, max = 200): string | null {
  const v = String(formData.get(key) ?? '').trim().slice(0, max);
  return v || null;
}

// Brand & market-research capture (Phase-1 "Brand Name & Market Research" step).
// Upserts only the brand fields — leaves any LLC/address values untouched. RLS
// (client_intake_insert/update) enforces the org match as defense-in-depth.
export async function saveBrandResearch(_prev: IntakeState, formData: FormData): Promise<IntakeState> {
  const supabase = await createClient();
  const orgId = await resolveOrgId(supabase);
  if (!orgId) return { ok: false, error: 'No organization on your account.' };

  const { error } = await supabase.from('client_intake').upsert(
    {
      organization_id: orgId,
      proposed_name: str(formData, 'proposed_name'),
      desired_domain: str(formData, 'desired_domain'),
      competitor_checked: String(formData.get('competitor_checked') ?? '') === 'on',
      competitor_notes: str(formData, 'competitor_notes', 2000),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id' },
  );
  if (error) return { ok: false, error: 'Could not save. Please try again.' };

  revalidatePath('/portal/onboarding');
  return { ok: true };
}

// Business / LLC + address capture (surfaced with the product picker). Upserts
// only the business fields — leaves brand-research values untouched.
export async function saveBusinessDetails(_prev: IntakeState, formData: FormData): Promise<IntakeState> {
  const supabase = await createClient();
  const orgId = await resolveOrgId(supabase);
  if (!orgId) return { ok: false, error: 'No organization on your account.' };

  const { error } = await supabase.from('client_intake').upsert(
    {
      organization_id: orgId,
      legal_name: str(formData, 'legal_name'),
      llc_state: str(formData, 'llc_state', 60),
      ein: str(formData, 'ein', 40),
      registered_agent: str(formData, 'registered_agent'),
      address_line1: str(formData, 'address_line1'),
      address_line2: str(formData, 'address_line2'),
      city: str(formData, 'city', 120),
      state: str(formData, 'state', 60),
      postal_code: str(formData, 'postal_code', 20),
      country: str(formData, 'country', 60) ?? 'US',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id' },
  );
  if (error) return { ok: false, error: 'Could not save. Please try again.' };

  revalidatePath('/portal/orders');
  revalidatePath('/portal/onboarding');
  return { ok: true };
}
