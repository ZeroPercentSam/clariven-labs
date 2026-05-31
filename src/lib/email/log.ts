import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';
import type { Database } from '@/lib/database.types';
import type { EmailKind, EmailStatus } from './log-constants';

/**
 * Write-through telemetry for every transactional email send.
 *
 * Invariant 7: this helper MUST never throw. The originating DB mutation
 * (order placement, status transition, cron) commits first; logging is
 * best-effort. Any error inserting the log row is swallowed to console.warn
 * so the originating action still returns ok.
 *
 * RLS (migration 0006): INSERT authenticated/service_role; SELECT/UPDATE/DELETE
 * admin-only (to_address is customer PII).
 */
export type LogEmailEvent = {
  to: string;
  kind: EmailKind;
  status: EmailStatus;
  subject?: string | null;
  resendMessageId?: string | null;
  error?: string | null;
};

export async function logEmailEvent(
  event: LogEmailEvent,
  // Optional pre-built client. Cron routes (no cookie session) pass the
  // service-role admin client so the write-through row survives RLS; the
  // default cookie client only works in an authenticated request context.
  client?: SupabaseClient<Database>,
): Promise<void> {
  if (!client && !supabaseEnvConfigured()) {
    console.info('[email_log:noop]', {
      kind: event.kind,
      status: event.status,
      to: event.to,
    });
    return;
  }
  try {
    const supabase = client ?? (await createClient());
    const { error } = await supabase.from('email_log').insert({
      to_address: event.to,
      kind: event.kind,
      status: event.status,
      subject: event.subject ?? null,
      resend_message_id: event.resendMessageId ?? null,
      error: event.error ?? null,
    });
    if (error) {
      console.warn('[email_log:error]', {
        kind: event.kind,
        status: event.status,
        to: event.to,
        msg: error.message,
      });
    }
  } catch (e) {
    // Invariant 7: never throw from the telemetry layer.
    console.warn('[email_log:error]', {
      kind: event.kind,
      status: event.status,
      to: event.to,
      err: e instanceof Error ? e.message : String(e),
    });
  }
}
