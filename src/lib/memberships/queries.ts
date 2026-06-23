import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { MembershipStatus } from './constants';

export type MembershipRequest = Database['public']['Tables']['membership_requests']['Row'];

// Admin-only reads (RLS gates SELECT to is_admin()). Volume is low (high-touch
// B2B intake) so a 500-row cap + in-memory status filter on the page is fine.
export async function listMembershipRequests(opts?: {
  status?: MembershipStatus;
}): Promise<MembershipRequest[]> {
  const supabase = await createClient();
  let q = supabase
    .from('membership_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (opts?.status) q = q.eq('status', opts.status);
  const { data } = await q;
  return data ?? [];
}

export async function getMembershipRequest(id: string): Promise<MembershipRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('membership_requests').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}
