'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { MEMBERSHIP_STATUSES, type MembershipStatus } from './constants';

// Admin updates the application status + notes. requireAdmin() + the table's
// admin-only UPDATE RLS both gate this.
export async function setMembershipStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as MembershipStatus;
  const notes = String(formData.get('notes') ?? '').trim().slice(0, 5000);
  if (!id) redirect('/admin/memberships');
  if (!(MEMBERSHIP_STATUSES as readonly string[]).includes(status)) {
    redirect(`/admin/memberships/${id}?error=${encodeURIComponent('Invalid status')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('membership_requests')
    .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) redirect(`/admin/memberships/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/admin/memberships/${id}`);
  redirect(`/admin/memberships/${id}?ok=status`);
}
