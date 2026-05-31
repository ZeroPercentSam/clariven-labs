import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth/roles';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import { listAuditEvents } from '@/lib/audit/queries';
import { AUDIT_TARGET_TYPES } from '@/lib/audit/constants';

// Admin CSV export of the audit log. Admin-gated (mirrors the page's
// requireAdmin) — 403 otherwise. Honors the same ?target= filter as the page.
export async function GET(request: NextRequest) {
  if (!supabaseEnvConfigured()) {
    return new NextResponse('Service unavailable', { status: 503 });
  }
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const targetParam = request.nextUrl.searchParams.get('target') ?? '';
  const targetType = (AUDIT_TARGET_TYPES as readonly string[]).includes(targetParam)
    ? targetParam
    : undefined;

  const events = await listAuditEvents({ targetType, limit: 5000 });
  const header = ['created_at', 'action', 'target_type', 'target_id', 'actor_email', 'payload'];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const e of events) {
    lines.push(
      [
        e.created_at,
        e.action,
        e.target_type,
        e.target_id,
        e.actor_email ?? '',
        e.payload ? JSON.stringify(e.payload) : '',
      ]
        .map(esc)
        .join(','),
    );
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clariven-audit-log.csv"',
    },
  });
}
