import { NextResponse } from 'next/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { getImpersonationContext } from '@/lib/impersonation/queries';

// Read endpoint for the global client banner. Returns the caller's active
// impersonation session (or null). RLS-safe: the RPC is keyed on auth.uid(), so
// anon / non-impersonating callers get null. no-store so the banner reflects the
// live session state on every navigation.
export async function GET() {
  if (!supabaseEnvConfigured()) return NextResponse.json(null);
  const ctx = await getImpersonationContext();
  return NextResponse.json(ctx, { headers: { 'Cache-Control': 'no-store' } });
}
