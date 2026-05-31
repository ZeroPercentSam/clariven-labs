import 'server-only';
import { Resend } from 'resend';

let cached: Resend | null | undefined;

/**
 * Lazily construct (and cache) the Resend client. Returns null when
 * RESEND_API_KEY is unset — on a fresh clone, in CI, or before the prod env
 * is wired — so the send layer can no-op cleanly instead of throwing
 * (invariant: side-effects never roll back the order).
 */
export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'ClarivenLabs <onboarding@resend.dev>';
}

/**
 * Optional Reply-To. We send from a no-reply alias on the verified subdomain
 * (noreply@updates.clarivenlabs.com) but want replies to land in a monitored
 * inbox on the root domain (support@clarivenlabs.com). When RESEND_REPLY_TO is
 * set we add the header; otherwise replies go to the from-address.
 */
export function getReplyToAddress(): string | null {
  const v = process.env.RESEND_REPLY_TO?.trim();
  return v && v.length > 0 ? v : null;
}
