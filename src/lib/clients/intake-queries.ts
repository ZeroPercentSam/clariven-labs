import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

export type ClientIntake = Database['public']['Tables']['client_intake']['Row'];

/** The signed-in client's intake row (RLS-scoped to their org). null if none. */
export async function getMyIntake(): Promise<ClientIntake | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (!profile?.organization_id) return null;
  const { data } = await supabase
    .from('client_intake')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .maybeSingle();
  return data ?? null;
}

/** Admin: a specific client's intake row. */
export async function getClientIntake(orgId: string): Promise<ClientIntake | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('client_intake')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle();
  return data ?? null;
}
