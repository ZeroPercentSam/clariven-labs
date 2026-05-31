import 'server-only';
import { getFromAddress, getReplyToAddress, getResendClient } from './client';
import { logEmailEvent } from './log';
import type { EmailKind } from './log-constants';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Categorizes the send in the admin /admin/email-log queue. */
  kind: EmailKind;
};

export type SendEmailResult =
  | { ok: true; id: string | null; noop?: boolean }
  | { ok: false; error: string };

/**
 * Sends a transactional email via Resend. When RESEND_API_KEY is missing
 * (fresh clone / CI / pre-cutover prod) the call no-ops with a console notice
 * so callers that depend on a server action's success path don't break.
 *
 * Real send failures return { ok: false } so the caller can decide whether to
 * surface them — but must NOT roll back the underlying DB mutation, since the
 * row state is the source of truth (invariant 7). Every call writes a
 * write-through row to email_log; the log write swallows its own errors.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.info('[email:noop]', { to: input.to, subject: input.subject, kind: input.kind });
    // Don't log a row for noop sends — they don't reflect real intent and
    // would pollute dev/CI feeds with noise.
    return { ok: true, id: null, noop: true };
  }
  const replyTo = getReplyToAddress();
  // Outer try/catch so network throws (DNS failure, fetch abort, bad key)
  // still produce an error row in email_log.
  let data: { id?: string | null } | null = null;
  let sendError: { message: string } | null = null;
  try {
    const result = await client.emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(replyTo ? { replyTo } : {}),
    });
    data = result.data;
    sendError = result.error
      ? { message: result.error.message ?? String(result.error) }
      : null;
  } catch (err) {
    sendError = {
      message: err instanceof Error ? err.message : String(err),
    };
  }

  if (sendError) {
    console.error('[email:error]', { to: input.to, subject: input.subject, kind: input.kind, error: sendError });
    await logEmailEvent({
      to: input.to,
      kind: input.kind,
      status: 'error',
      subject: input.subject,
      error: sendError.message,
    });
    return { ok: false, error: sendError.message };
  }
  await logEmailEvent({
    to: input.to,
    kind: input.kind,
    status: 'sent',
    subject: input.subject,
    resendMessageId: data?.id ?? null,
  });
  return { ok: true, id: data?.id ?? null };
}

/**
 * Log a suppressed send (a notification-prefs gate said no). No Resend call
 * happens. Useful for surfacing in /admin/email-log when a recipient has
 * opted out of a transactional kind.
 */
export async function logSuppressedEmail(
  to: string,
  kind: EmailKind,
  subject?: string,
): Promise<void> {
  await logEmailEvent({ to, kind, status: 'suppressed', subject: subject ?? null });
}
