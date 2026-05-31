'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const ALLOWED_MIME = new Set(['application/pdf']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const CATEGORIES = new Set(['starter-kit', 'guide', 'protocol', 'reference', 'document']);

/**
 * Admin-only client-resource upload. Adds a downloadable doc to the private
 * `client-resources` bucket + a row in client_resources, surfaced on
 * /portal/resources to logged-in customers.
 *
 * Env-resilience contract (#8): short-circuit before createClient() if env is
 * missing, so misconfig surfaces as an inline error instead of a 500.
 */
export async function uploadResource(formData: FormData): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: "Can't reach storage right now. Try again shortly." };
  }
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }

  const title = (formData.get('title') ?? '').toString().trim();
  if (!title) return { ok: false, error: 'Title is required.' };
  const description = (formData.get('description') ?? '').toString().trim() || null;
  const categoryRaw = (formData.get('category') ?? 'document').toString().trim();
  const category = CATEGORIES.has(categoryRaw) ? categoryRaw : 'document';
  const sortOrderRaw = Number.parseInt((formData.get('sort_order') ?? '0').toString(), 10);
  const sortOrder = Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0;

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose a PDF to upload.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: 'File is over 20 MB. Compress before uploading.' };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: 'Resource must be a PDF.' };
  }

  const safeName =
    file.name
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'resource.pdf';
  const filePath = `${category}/${Date.now()}-${safeName}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: storageErr } = await supabase.storage
    .from('client-resources')
    .upload(filePath, buffer, { contentType: file.type, upsert: false });
  if (storageErr) {
    return { ok: false, error: `Storage upload failed: ${storageErr.message}` };
  }

  const { error: insertErr } = await supabase.from('client_resources').insert({
    title: title.slice(0, 200),
    description: description?.slice(0, 1000) ?? null,
    category,
    file_path: filePath,
    file_name: file.name.slice(0, 200),
    file_bytes: file.size,
    sort_order: sortOrder,
  });
  if (insertErr) {
    // Roll back the storage upload so we don't orphan a file with no DB row.
    await supabase.storage
      .from('client-resources')
      .remove([filePath])
      .catch((e) => console.error('[resource:rollback]', { filePath, e }));
    return { ok: false, error: insertErr.message };
  }

  revalidatePath('/admin/resources');
  revalidatePath('/portal/resources');
  return { ok: true };
}

/** Admin-only deletion: removes the DB row and the underlying storage file. */
export async function deleteResource(id: string): Promise<ActionResult> {
  if (!supabaseEnvConfigured()) {
    return { ok: false, error: 'Storage unavailable. Try again shortly.' };
  }
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Admin only.' };
  }
  if (!id) return { ok: false, error: 'Missing resource id.' };

  const supabase = await createClient();
  const { data: row, error: fetchErr } = await supabase
    .from('client_resources')
    .select('file_path')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row) return { ok: false, error: 'Resource not found.' };

  const { error: deleteErr } = await supabase.from('client_resources').delete().eq('id', id);
  if (deleteErr) return { ok: false, error: deleteErr.message };

  await supabase.storage
    .from('client-resources')
    .remove([row.file_path])
    .catch((e) => console.error('[resource:cleanup-after-delete]', e));

  revalidatePath('/admin/resources');
  revalidatePath('/portal/resources');
  return { ok: true };
}
