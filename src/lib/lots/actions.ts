'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import type { Json } from '@/lib/database.types';

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const ALLOWED_MIME = new Set(['application/pdf']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;

type SupabaseInstance = Awaited<ReturnType<typeof createClient>>;

async function audit(actorId: string, action: string, targetId: string, payload: Json = {}) {
  const supabase = await createClient();
  await supabase.from('admin_audit_log').insert({
    actor_id: actorId,
    action,
    target_type: 'product_lot',
    target_id: targetId,
    payload,
  });
}

// Upload a lot COA PDF into the public product-coas bucket (path lots/…) and
// return its storage metadata. Reuses the product_coas storage RLS (admin-write).
async function uploadLotCoaFile(
  supabase: SupabaseInstance,
  productSlug: string,
  file: File,
): Promise<{ path: string; name: string; bytes: number } | { error: string }> {
  if (file.size > MAX_FILE_BYTES) return { error: 'File is over 20 MB. Compress before uploading.' };
  if (!ALLOWED_MIME.has(file.type)) return { error: 'COA must be a PDF.' };
  const safeName =
    file.name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'coa.pdf';
  const path = `lots/${productSlug}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from('product-coas')
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return { error: `Storage upload failed: ${error.message}` };
  return { path, name: file.name.slice(0, 200), bytes: file.size };
}

/** Admin-only: create a lot, optionally with an initial COA PDF. */
export async function createLot(formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: "Can't reach storage right now. Try again shortly." };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }

  const productSlug = (formData.get('product_slug') ?? '').toString().trim();
  const strengthLabel = (formData.get('strength_label') ?? '').toString().trim();
  const lotNumber = (formData.get('lot_number') ?? '').toString().trim();
  const expirationDate = (formData.get('expiration_date') ?? '').toString().trim();
  const receivedAt = (formData.get('received_at') ?? '').toString().trim() || null;
  const notes = (formData.get('notes') ?? '').toString().trim() || null;
  if (!productSlug) return { ok: false, error: 'Choose a product.' };
  if (!lotNumber) return { ok: false, error: 'Lot number is required.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) return { ok: false, error: 'Valid expiration date is required.' };

  const supabase = await createClient();

  let coa: { path: string; name: string; bytes: number } | null = null;
  const file = formData.get('file');
  if (file instanceof File && file.size > 0) {
    const up = await uploadLotCoaFile(supabase, productSlug, file);
    if ('error' in up) return { ok: false, error: up.error };
    coa = up;
  }

  const { data: inserted, error: insErr } = await supabase
    .from('product_lots')
    .insert({
      product_slug: productSlug,
      strength_label: strengthLabel,
      lot_number: lotNumber,
      expiration_date: expirationDate,
      received_at: receivedAt,
      notes,
      uploaded_by: admin.id,
      ...(coa ? { coa_file_path: coa.path, coa_file_name: coa.name, coa_file_bytes: coa.bytes, coa_uploaded_at: new Date().toISOString() } : {}),
    })
    .select('id')
    .single();
  if (insErr || !inserted) {
    if (coa) await supabase.storage.from('product-coas').remove([coa.path]).catch(() => {});
    if (insErr?.code === '23505') return { ok: false, error: 'That lot number already exists for this product + strength.' };
    return { ok: false, error: insErr?.message ?? 'Could not create the lot.' };
  }

  await audit(admin.id, 'product_lot.created', inserted.id, { product_slug: productSlug, lot_number: lotNumber });
  revalidatePath('/admin/lots');
  return { ok: true };
}

/** Admin-only: replace/add a lot's COA PDF (cleans up the prior file). */
export async function uploadLotCoa(formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: "Can't reach storage right now. Try again shortly." };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  const lotId = (formData.get('lot_id') ?? '').toString().trim();
  if (!lotId) return { ok: false, error: 'Missing lot.' };
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Choose a PDF to upload.' };

  const supabase = await createClient();
  const { data: lot, error: fetchErr } = await supabase
    .from('product_lots')
    .select('product_slug, coa_file_path')
    .eq('id', lotId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!lot) return { ok: false, error: 'Lot not found.' };

  const up = await uploadLotCoaFile(supabase, lot.product_slug, file);
  if ('error' in up) return { ok: false, error: up.error };

  const { error: updErr } = await supabase
    .from('product_lots')
    .update({ coa_file_path: up.path, coa_file_name: up.name, coa_file_bytes: up.bytes, coa_uploaded_at: new Date().toISOString() })
    .eq('id', lotId);
  if (updErr) {
    await supabase.storage.from('product-coas').remove([up.path]).catch(() => {});
    return { ok: false, error: updErr.message };
  }
  if (lot.coa_file_path && lot.coa_file_path !== up.path) {
    await supabase.storage.from('product-coas').remove([lot.coa_file_path]).catch((e) => console.error('[lot-coa:cleanup]', e));
  }

  await audit(admin.id, 'product_lot.coa', lotId, {});
  revalidatePath('/admin/lots');
  return { ok: true };
}

/** Admin-only: toggle a lot's active flag (quick action). */
export async function setLotActive(lotId: string, active: boolean): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'Data service unavailable.' };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!lotId) return { ok: false, error: 'Missing lot.' };

  const supabase = await createClient();
  const { error } = await supabase.from('product_lots').update({ active }).eq('id', lotId);
  if (error) return { ok: false, error: error.message };

  await audit(admin.id, 'product_lot.updated', lotId, { active });
  revalidatePath('/admin/lots');
  return { ok: true };
}

/** Admin-only: delete a lot (cascades alert history) + clean up its COA file. */
export async function deleteLot(lotId: string): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) return { ok: false, error: 'Data service unavailable.' };
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!lotId) return { ok: false, error: 'Missing lot.' };

  const supabase = await createClient();
  const { data: lot, error: fetchErr } = await supabase
    .from('product_lots')
    .select('coa_file_path')
    .eq('id', lotId)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!lot) return { ok: false, error: 'Lot not found.' };

  const { error: delErr } = await supabase.from('product_lots').delete().eq('id', lotId);
  if (delErr) return { ok: false, error: delErr.message };

  if (lot.coa_file_path) {
    await supabase.storage.from('product-coas').remove([lot.coa_file_path]).catch((e) => console.error('[lot:cleanup-after-delete]', e));
  }

  await audit(admin.id, 'product_lot.deleted', lotId, {});
  revalidatePath('/admin/lots');
  return { ok: true };
}
