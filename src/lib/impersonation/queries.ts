import 'server-only';
import { createClient } from '@/lib/supabase/server';

export const IMPERSONATION_TTL_MINUTES = 15;

export type ImpersonationContext = {
  session_id: string;
  impersonated_user_id: string;
  email: string | null;
  full_name: string | null;
  expires_at: string;
  started_at: string;
};

// The caller's active impersonation session (or null). get_impersonation_context
// is a SECURITY DEFINER table fn keyed on auth.uid() — RLS-safe, returns at most
// one row (one active session per admin).
export async function getImpersonationContext(): Promise<ImpersonationContext | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_impersonation_context');
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as ImpersonationContext;
  }
  return null;
}
