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

const PROTECTED_PREFIXES = ['/portal', '/admin', '/checkout', '/cart', '/onboarding'] as const;
const ADMIN_PREFIX = '/admin';
// Routes that additionally require an APPROVED organization (the order
// approval-gate's UX layer). /portal + /onboarding stay reachable so a pending
// user can see their status and complete onboarding.
const ORG_GATED_PREFIXES = ['/cart', '/checkout'] as const;
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

  // Gate protected routes.
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

  // Org onboarding gate: a non-staff customer must belong to an APPROVED org to
  // reach /cart or /checkout. No org → /onboarding/attest; an org that is not
  // yet approved (pending/rejected/suspended) → /onboarding/pending. This is the
  // UX layer of the approval gate — create_order_with_items is the authoritative
  // enforcement, so this can never be the only thing standing between an
  // unapproved org and an order. Admins (staff, NULL org) are exempt.
  if (user && ORG_GATED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      // Active reps are staff-adjacent: they have no customer org and must not
      // be trapped in /onboarding/attest. Treat them like admins for this gate.
      const { data: isRep } = await supabase.rpc('is_active_rep');
      if (!isRep) {
        if (!profile?.organization_id) {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding/attest';
          url.search = '';
          return NextResponse.redirect(url);
        }
        const { data: org } = await supabase
          .from('organizations')
          .select('approval_status')
          .eq('id', profile.organization_id)
          .single();
        if (org?.approval_status !== 'approved') {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding/pending';
          url.search = '';
          return NextResponse.redirect(url);
        }
      }
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
