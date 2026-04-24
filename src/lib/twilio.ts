import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

type NewOrderSmsArgs = {
  orderNumber: number;
  customerName: string;
  itemCount: number;
  totalCents: number;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clarivenlabs.com';

function formatBody(a: NewOrderSmsArgs) {
  const dollars = (a.totalCents / 100).toFixed(2);
  return `[Clariven Labs] New order #${a.orderNumber} — ${a.customerName}, ${a.itemCount} item(s), $${dollars}. ${SITE_URL}/admin/orders`;
}

async function logMock(body: string, to: string) {
  try {
    const p = path.resolve(process.cwd(), '.twilio-log.jsonl');
    await fs.appendFile(
      p,
      JSON.stringify({ ts: new Date().toISOString(), to, body }) + '\n',
      'utf8',
    );
  } catch {
    /* ignore */
  }
}

/**
 * Sends one text to Katie announcing a new order. Never throws into the caller;
 * a Twilio outage must not block an order submission.
 */
export async function sendKatieNewOrderSms(args: NewOrderSmsArgs): Promise<{ ok: boolean }> {
  const body = formatBody(args);
  const to = process.env.KATIE_PHONE_NUMBER;
  if (!to) return { ok: false };

  if (process.env.TWILIO_MOCK === 'true') {
    await logMock(body, to);
    return { ok: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false };

  try {
    // Dynamic import keeps the twilio SDK out of bundles that don't need it.
    const { default: twilio } = await import('twilio');
    const client = twilio(sid, token);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      await client.messages.create({ from, to, body });
      return { ok: true };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return { ok: false };
  }
}
