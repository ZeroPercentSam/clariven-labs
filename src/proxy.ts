import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Next.js 16 `proxy` convention (formerly `middleware.ts`). Same matcher +
// behavior; the file is renamed to match the Next-16 convention used by the
// sibling Bioveris / Purity repos. The `@/lib/supabase/middleware` import is a
// helper module (updateSession), unrelated to the framework entrypoint name.

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-DNS-Prefetch-Control': 'off',
};

const PROTECTED_PREFIXES = ['/portal', '/admin'] as const;
const ADMIN_PREFIX = '/admin';
// Store + self-serve-signup surfaces were removed in the consulting pivot.
// Redirect any lingering bookmark / external link to a live destination instead
// of 404-ing.
const REMOVED_TO_HOME = ['/products', '/cart', '/checkout', '/rep', '/rep-invite'] as const;
const REMOVED_TO_LOGIN = ['/signup', '/onboarding'] as const;
const REF_COOKIE = 'cl_ref';
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const { response, user, supabase } = await updateSession(request);

  // Stamp a referral cookie when ?ref=CODE is present (lowercased normalization).
  const refParam = searchParams.get('ref');
  if (refParam && refParam.length > 0 && refParam.length < 64) {
    response.cookies.set(REF_COOKIE, refParam.toUpperCase(), {
      maxAge: REF_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Attach security headers to every response.
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // Redirect removed store / self-serve-signup surfaces to a live destination.
  const matches = (prefixes: readonly string[]) =>
    prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (matches(REMOVED_TO_HOME) || matches(REMOVED_TO_LOGIN)) {
    const url = request.nextUrl.clone();
    url.pathname = matches(REMOVED_TO_HOME) ? '/' : '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Gate protected routes (auth required).
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Admin gate: verify role before allowing /admin/*.
  if (pathname.startsWith(ADMIN_PREFIX) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except Next internals and static files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
};
