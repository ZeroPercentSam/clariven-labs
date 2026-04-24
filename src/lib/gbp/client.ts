import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: true,
  trimValues: true,
});

export function isMock(): boolean {
  return process.env.GBP_MOCK === 'true';
}

function requireCreds() {
  const clientId = process.env.GBP_CLIENT_ID;
  const apiPassword = process.env.GBP_API_PASSWORD;
  const base = process.env.GBP_API_BASE || 'https://www.greenbyphone.com';
  if (!clientId || !apiPassword) {
    throw new Error('GBP_CLIENT_ID / GBP_API_PASSWORD missing');
  }
  return { clientId, apiPassword, base };
}

/**
 * Call a Green.Money eCheck.asmx method over HTTP POST (form-encoded).
 * Returns the parsed XML body as a plain object.
 */
export async function callECheck(method: string, params: Record<string, string>) {
  if (isMock()) return mockResponse(method, params);

  const { clientId, apiPassword, base } = requireCreds();
  const body = new URLSearchParams({
    Client_ID: clientId,
    ApiPassword: apiPassword,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v ?? ''])),
    x_delim_data: '',
    x_delim_char: '',
  });

  const res = await fetch(`${base}/eCheck.asmx/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GBP ${method} ${res.status}: ${redact(text)}`);
  return parser.parse(text);
}

export async function callENotification(method: string, params: Record<string, string>) {
  if (isMock()) return mockResponse(method, params);
  const { clientId, apiPassword, base } = requireCreds();
  const body = new URLSearchParams({
    Client_ID: clientId,
    ApiPassword: apiPassword,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v ?? ''])),
    x_delim_data: '',
    x_delim_char: '',
  });
  const res = await fetch(`${base}/eNotification.asmx/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GBP-notif ${method} ${res.status}: ${redact(text)}`);
  return parser.parse(text);
}

function redact(s: string): string {
  return s.replace(/(password|apipassword|client_id)[^&<]{0,40}/gi, (m) => m.slice(0, 12) + '…');
}

/**
 * Mock responses used when GBP_MOCK=true. Writes JSONL log for test assertions.
 */
async function mockResponse(method: string, params: Record<string, string>) {
  const logPath = path.resolve(process.cwd(), '.gbp-log.jsonl');
  const record = { ts: new Date().toISOString(), method, params };
  try {
    await fs.appendFile(logPath, JSON.stringify(record) + '\n', 'utf8');
  } catch {
    /* ignore */
  }

  switch (method) {
    case 'OneTimeInvoice': {
      const invoiceId = `mock_${Math.random().toString(36).slice(2, 10)}`;
      const checkId = `mock_ck_${Math.random().toString(36).slice(2, 10)}`;
      return {
        OneTimeInvoiceResult: {
          Result: '0',
          ResultDescription: 'Mock: invoice stored',
          PaymentResult: '3',
          PaymentResultDescription: 'No payment entered',
          Invoice_ID: invoiceId,
          Check_ID: checkId,
        },
      };
    }
    case 'InvoiceStatus': {
      // Default mock: still pending. Test helper will override via env or file.
      return {
        InvoiceStatusResult: {
          Result: '0',
          ResultDescription: 'Mock: invoice found',
          PaymentResult: '3',
          PaymentResultDescription: 'No payment entered',
          Invoice_ID: params.Invoice_ID ?? '',
          Check_ID: '',
        },
      };
    }
    case 'CancelInvoice':
      return { CancelInvoiceResult: { Result: '0', ResultDescription: 'Mock: cancelled' } };
    case 'ResendInvoiceNotification':
      return {
        ResendInvoiceNotificationResult: { Result: '0', ResultDescription: 'Mock: resent' },
      };
    case 'UnseenNotifications':
    case 'AllNotifications':
      return {
        [`${method}Result`]: {
          Result: '0',
          ResultDescription: 'Mock',
          NotificationsCount: 0,
          Notifications: '',
        },
      };
    case 'ClearNotification':
      return {
        ClearNotificationResult: { Result: '0', ResultDescription: 'Mock', NotificationsCount: 1 },
      };
    default:
      return { [`${method}Result`]: { Result: '0', ResultDescription: `Mock: ${method}` } };
  }
}
