'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

function codeError(message: string): never {
  redirect(`/rep/codes?error=${encodeURIComponent(message)}`);
}

/**
 * A rep self-mints a discount code. It lands `pending` (the RLS insert policy +
 * the lock trigger enforce rep-own + pending + no affiliate_id); an admin
 * approves it before it can validate/apply (0019 active-only guards). The rep
 * earns commission on orders that apply their approved code (code path in
 * write_rep_commission_for_order).
 */
export async function createRepCode(formData: FormData): Promise<void> {
  if (!supabaseEnvConfigured()) codeError("Can't reach the server right now. Try again shortly.");

  const code = String(formData.get('code') ?? '')
    .trim()
    .toUpperCase();
  const discountRaw = String(formData.get('discount_pct') ?? '').trim();

  if (!/^[A-Z0-9][A-Z0-9-]{2,31}$/.test(code)) {
    codeError('Code must be 3–32 chars: letters, numbers, dashes.');
  }
  const discount = Number(discountRaw);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    codeError('Discount must be a percentage between 0 and 100.');
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login?next=/rep/codes');

  const { error } = await supabase.from('affiliate_codes').insert({
    code,
    discount_pct: discount,
    rep_user_id: auth.user.id,
    affiliate_id: null,
    approval_status: 'pending',
    active: true,
  });
  if (error) {
    const msg = error.code === '23505' ? 'That code is already taken — pick another.' : error.message;
    codeError(msg);
  }

  revalidatePath('/rep/codes');
  redirect('/rep/codes?ok=1');
}
