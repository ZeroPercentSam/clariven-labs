import { createClient } from '@/lib/supabase/server';

// Read layer for product lots. RLS on product_lots (migration 0023) is
// admin-only — these run on the authenticated SSR client and return [] for
// non-admins. COA files live in the public product-coas bucket → public URL.

export type LotRow = {
  id: string;
  productSlug: string;
  strengthLabel: string;
  lotNumber: string;
  expirationDate: string;
  coaFilePath: string | null;
  coaFileName: string | null;
  coaPublicUrl: string | null;
  receivedAt: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

export async function listLots(): Promise<LotRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_lots')
    .select(
      'id, product_slug, strength_label, lot_number, expiration_date, coa_file_path, coa_file_name, received_at, notes, active, created_at',
    )
    .order('expiration_date', { ascending: true });
  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    productSlug: r.product_slug,
    strengthLabel: r.strength_label,
    lotNumber: r.lot_number,
    expirationDate: r.expiration_date,
    coaFilePath: r.coa_file_path,
    coaFileName: r.coa_file_name,
    coaPublicUrl: r.coa_file_path
      ? supabase.storage.from('product-coas').getPublicUrl(r.coa_file_path).data.publicUrl
      : null,
    receivedAt: r.received_at,
    notes: r.notes,
    active: r.active,
    createdAt: r.created_at,
  }));
}
