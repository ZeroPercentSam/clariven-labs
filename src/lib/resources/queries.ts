import { createClient } from '@/lib/supabase/server';

export type ClientResourceView = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string | null;
  fileBytes: number | null;
  active: boolean;
  signedUrl: string | null;
};

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Client resources for the portal (active only) or admin (includeInactive).
 * The bucket is private; each row gets a short-lived signed download URL.
 * RLS already hides inactive rows from non-admins, but we filter explicitly
 * so an admin viewing the customer page still sees only what customers see.
 */
export async function getClientResources(includeInactive = false): Promise<ClientResourceView[]> {
  const supabase = await createClient();
  let query = supabase
    .from('client_resources')
    .select('id, title, description, category, file_path, file_name, file_bytes, active, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (!includeInactive) query = query.eq('active', true);

  const { data } = await query;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from('client-resources')
    .createSignedUrls(
      rows.map((r) => r.file_path),
      SIGNED_URL_TTL_SECONDS,
    );
  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.signedUrl) urlByPath.set(s.path ?? '', s.signedUrl);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    fileName: r.file_name,
    fileBytes: r.file_bytes,
    active: r.active,
    signedUrl: urlByPath.get(r.file_path) ?? null,
  }));
}
