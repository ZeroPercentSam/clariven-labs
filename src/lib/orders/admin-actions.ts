'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { ORDER_REQUEST_STATUSES, type OrderRequestStatus } from './constants';

// Admin advances an order request's status. requireAdmin() + admin-only UPDATE RLS.
export async function setOrderRequestStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as OrderRequestStatus;
  if (!id) redirect('/admin/orders');
  if (!(ORDER_REQUEST_STATUSES as readonly string[]).includes(status)) {
    redirect(`/admin/orders/${id}?error=${encodeURIComponent('Invalid status')}`);
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from('order_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) redirect(`/admin/orders/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?ok=status`);
}
