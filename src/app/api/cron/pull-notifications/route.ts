import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { clearNotification, pullUnseenNotifications } from '@/lib/gbp/invoices';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return request.headers.get('authorization') === `Bearer ${expected}`;
}

function extractInvoiceId(message: string): string | null {
  // Green's notification Messages are unstructured text. Best-effort extraction
  // of the first numeric id after "Invoice".
  const m = message.match(/invoice[^\d]{0,10}(\d{3,12})/i);
  return m ? m[1] : null;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const notifications = await pullUnseenNotifications();

  let stored = 0;
  for (const n of notifications) {
    const { error } = await admin.from('gbp_notifications').upsert(
      {
        id: n.id,
        message: n.message,
        entry_client_id: n.entryClientId,
        invoice_id: extractInvoiceId(n.message),
        time_created: n.timeCreated,
      },
      { onConflict: 'id' },
    );
    if (!error) stored += 1;
    // Mark as seen in Green so next pull returns only new ones.
    await clearNotification(n.id);
  }

  return NextResponse.json({ ok: true, pulled: notifications.length, stored });
}
