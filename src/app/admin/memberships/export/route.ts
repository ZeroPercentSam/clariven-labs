import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { listMembershipRequests } from '@/lib/memberships/queries';
import { MEMBERSHIP_STATUSES, type MembershipStatus } from '@/lib/memberships/constants';

// Admin CSV export of client applications. Admin-gated (mirrors the page's
// requireAdmin). Honors the same ?status= filter as the page.
export async function GET(request: NextRequest) {
  if (!supabaseEnvConfigured()) {
    return new NextResponse('Service unavailable', { status: 503 });
  }
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const statusParam = request.nextUrl.searchParams.get('status') ?? '';
  const status = (MEMBERSHIP_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as MembershipStatus)
    : undefined;

  const rows = await listMembershipRequests({ status });
  const header = ['created_at', 'status', 'full_name', 'email', 'phone', 'proposed_brand', 'source', 'message', 'notes'];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.created_at, r.status, r.full_name, r.email, r.phone, r.proposed_brand, r.source, r.message, r.notes]
        .map(esc)
        .join(','),
    );
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clariven-applications.csv"',
    },
  });
}
