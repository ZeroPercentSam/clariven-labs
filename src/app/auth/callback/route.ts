import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

/**
 * PKCE / magic-link callback. Exchanges the `code` in the email URL for a
 * session cookie BEFORE the user lands on the final page. Serves every
 * @supabase/ssr flow — recovery, email confirm, magic-link, invite — just
 * redirect to /auth/callback?next=<final> (portable-fix #10).
 *
 * Hardened: env-guarded (no 500 when Supabase env is unset), distinct
 * missing-code branch, surfaces the exchange-error reason, and only honours a
 * same-origin leading-slash `next` (open-redirect guard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/portal';

  if (!supabaseEnvConfigured()) {
    return NextResponse.redirect(new URL('/login?error=auth_unavailable', origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const p = new URLSearchParams({ error: 'exchange_failed', reason: error.message });
    return NextResponse.redirect(new URL(`/login?${p.toString()}`, origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
