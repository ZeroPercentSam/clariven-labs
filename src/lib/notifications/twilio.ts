import 'server-only';

/**
 * Thin Twilio SMS client (ported from Purity Science). Sends a text from the
 * Clariven Twilio number via the REST API — no SDK dependency. Inert until
 * TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER are all set, so
 * nothing fires in dev/CI or before the env is wired. TWILIO_MOCK=true forces a
 * logged no-op even when creds are present (matches the repo mock convention +
 * keeps e2e/CI from sending real texts).
 *
 *   TWILIO_ACCOUNT_SID   AC… account SID (server-only)
 *   TWILIO_AUTH_TOKEN    auth token (server-only secret)
 *   TWILIO_FROM_NUMBER   Twilio-owned sender in E.164 (e.g. +13862005247)
 *
 * Docs: POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
 *   Basic auth (SID:token); form-encoded body { From, To, Body }.
 */

export function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

export type SendSmsResult = { ok: true; id: string | null } | { ok: false; error: string };

/**
 * Send an SMS from the Clariven Twilio number. Returns an error result rather
 * than throwing — callers treat SMS as a soft side-effect (never block the
 * originating action). No-ops with ok:false when the Twilio env isn't fully set.
 */
export async function sendTwilioSms(toNumber: string, body: string): Promise<SendSmsResult> {
  // Mock convention: never hit the API in mock mode (CI/dev), even if creds are present.
  if (process.env.TWILIO_MOCK === 'true') {
    console.info('[sms:mock]', { to: toNumber, body });
    return { ok: true, id: null };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false, error: 'Twilio env not set' };

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Basic ${auth}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: toNumber, Body: body }).toString(),
    });
    const data = (await res.json().catch(() => null)) as
      | { sid?: string; code?: number; message?: string }
      | null;
    if (!res.ok) {
      const code = data?.code ? ` [${data.code}]` : '';
      const detail = data?.message ? `: ${data.message.slice(0, 200)}` : '';
      return { ok: false, error: `Twilio ${res.status}${code}${detail}` };
    }
    return { ok: true, id: data?.sid ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
