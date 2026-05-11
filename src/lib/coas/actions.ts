'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const ALLOWED_MIME = new Set(['application/pdf']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function envConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Admin-only COA upload. One COA per (product_slug, strength_label);
 * uploading a new one replaces the prior storage object and the prior DB
 * row (via the unique constraint on the table — we delete then insert).
 *
 * Env-resilience contract: short-circuits before createClient() if env vars
 * are missing, so missing config surfaces as an inline error instead of a 500.
 */
export async function uploadCoa(formData: FormData): Promise<ActionResult> {
  if (!envConfigured()) {
    return {
      ok: false,
      error:
        "Can't reach storage right now. Try again in a moment or contact support if this persists.",
    };
  }

  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }

  const productSlug = (formData.get('product_slug') ?? '').toString().trim();
  const strengthLabel = (formData.get('strength_label') ?? '').toString().trim();
  if (!productSlug) return { ok: false, error: 'Missing product_slug.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose a PDF to upload.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: 'File is over 20 MB. Compress before uploading.' };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: 'COA must be a PDF.' };
  }

  const safeName =
    file.name
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'coa.pdf';
  const strengthSegment = strengthLabel
    ? strengthLabel.replace(/[^A-Za-z0-9._-]+/g, '-')
    : '__default';
  const filePath = `${productSlug}/${strengthSegment}-${Date.now()}-${safeName}`;

  const supabase = await createClient();

  // If a prior COA exists for this (slug, strength), remember its path so we
  // can clean up storage after the DB row is replaced. Storage cleanup is
  // best-effort — a stranded file is preferable to a missing pointer.
  const { data: prior } = await supabase
    .from('product_coas')
    .select('file_path')
    .eq('product_slug', productSlug)
    .eq('strength_label', strengthLabel)
    .maybeSingle();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: storageErr } = await supabase.storage
    .from('product-coas')
    .upload(filePath, buffer, { contentType: file.type, upsert: false });
  if (storageErr) {
    return { ok: false, error: `Storage upload failed: ${storageErr.message}` };
  }

  const { error: upsertErr } = await supabase
    .from('product_coas')
    .upsert(
      {
        product_slug: productSlug,
        strength_label: strengthLabel,
        file_path: filePath,
        file_name: file.name.slice(0, 200),
        file_bytes: file.size,
      },
      { onConflict: 'product_slug,strength_label' },
    );
  if (upsertErr) {
    // Roll back the storage upload so we don't orphan a file with no DB row.
    await supabase.storage
      .from('product-coas')
      .remove([filePath])
      .catch((e) => console.error('[coa:rollback]', { filePath, e }));
    return { ok: false, error: upsertErr.message };
  }

  if (prior?.file_path && prior.file_path !== filePath) {
    await supabase.storage
      .from('product-coas')
      .remove([prior.file_path])
      .catch((e) => console.error('[coa:cleanup]', { path: prior.file_path, e }));
  }

  revalidatePath(`/products/${productSlug}`);
  revalidatePath('/admin/pricing');
  return { ok: true };
}

/**
 * Admin-only deletion: removes the DB row and the underlying storage file.
 */
export async function deleteCoa(coaId: string): Promise<ActionResult> {
  if (!envConfigured()) {
    return { ok: false, error: 'Storage unavailable. Try again shortly.' };
  }
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!coaId) return { ok: false, error: 'Missing coa id.' };

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from('product_coas')
    .select('product_slug, file_path')
    .eq('id', coaId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'COA not found.' };

  const { error: deleteErr } = await supabase
    .from('product_coas')
    .delete()
    .eq('id', coaId);
  if (deleteErr) return { ok: false, error: deleteErr.message };

  await supabase.storage
    .from('product-coas')
    .remove([row.file_path])
    .catch((e) => console.error('[coa:cleanup-after-delete]', e));

  revalidatePath(`/products/${row.product_slug}`);
  revalidatePath('/admin/pricing');
  return { ok: true };
}
