import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type AgreementForSign = { id: string; slug: string; label: string; body_md: string };
export type AgreementConsent = {
  version_id: string;
  slug: string;
  signed_legal_name: string;
  signed_at: string;
};

// Current (not-retired) agreement per slug — the versions a client signs.
export async function getActiveAgreements(): Promise<AgreementForSign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('client_agreements')
    .select('id, slug, label, body_md')
    .is('retired_at', null)
    .order('slug');
  return data ?? [];
}

// Consents for one org (portal passes the caller's org; admin passes the client's).
export async function getAgreementConsents(orgId: string): Promise<AgreementConsent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('client_agreement_consents')
    .select('version_id, signed_legal_name, signed_at, client_agreements(slug)')
    .eq('organization_id', orgId);
  return (data ?? []).map((r) => {
    const ca = r.client_agreements as unknown as { slug: string } | { slug: string }[] | null;
    const slug = Array.isArray(ca) ? ca[0]?.slug : ca?.slug;
    return {
      version_id: r.version_id,
      slug: slug ?? '',
      signed_legal_name: r.signed_legal_name,
      signed_at: r.signed_at,
    };
  });
}
