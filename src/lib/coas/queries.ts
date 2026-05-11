import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type ProductCoa = {
  id: string;
  product_slug: string;
  strength_label: string;
  file_path: string;
  file_name: string | null;
  file_bytes: number | null;
  updated_at: string;
  publicUrl: string;
};

/**
 * Returns all COA rows for a product slug. Each row has a strength_label
 * ('' = product-level / "default" COA, otherwise scoped to a strength).
 *
 * RLS on product_coas is anon-readable so this works without auth.
 * The bucket is public, so publicUrl is a permanent direct link — no
 * signing required.
 */
export async function getCoasForProduct(productSlug: string): Promise<ProductCoa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_coas')
    .select('id, product_slug, strength_label, file_path, file_name, file_bytes, updated_at')
    .eq('product_slug', productSlug)
    .order('strength_label', { ascending: true });
  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    publicUrl: supabase.storage.from('product-coas').getPublicUrl(row.file_path).data.publicUrl,
  }));
}

/**
 * Returns a single "best" COA for a product — strength-specific if one
 * exists for the given strength_label, otherwise the product-level default
 * (strength_label = ''), otherwise null.
 */
export async function getBestCoa(
  productSlug: string,
  strengthLabel: string | null,
): Promise<ProductCoa | null> {
  const all = await getCoasForProduct(productSlug);
  if (all.length === 0) return null;
  if (strengthLabel) {
    const specific = all.find((c) => c.strength_label === strengthLabel);
    if (specific) return specific;
  }
  return all.find((c) => c.strength_label === '') ?? all[0] ?? null;
}
