import 'server-only';
import { callECheck, callENotification } from './client';
import type {
  ClientNotification,
  CreateInvoiceArgs,
  CreateInvoiceResult,
  InvoiceStatusResult,
  SimpleResult,
} from './types';

function mmddyyyy(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getFullYear()}`;
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Submit a one-time invoice. Green emails the customer a signed-eCheck link. */
export async function createOneTimeInvoice(args: CreateInvoiceArgs): Promise<CreateInvoiceResult> {
  try {
    const parsed = await callECheck('OneTimeInvoice', {
      CustomerName: args.customerName.slice(0, 100),
      EmailAddress: args.customerEmail.slice(0, 200),
      ItemName: `Order #${args.orderNumber}`.slice(0, 100),
      ItemDescription: args.itemSummary.slice(0, 500),
      Amount: dollars(args.amountCents),
      PaymentDate: mmddyyyy(),
    });
    const r = parsed?.OneTimeInvoiceResult ?? {};
    const resultCode = String(r.Result ?? '');
    const ok = resultCode === '0';
    return {
      ok,
      invoiceId: r.Invoice_ID ? String(r.Invoice_ID) : undefined,
      checkId: r.Check_ID ? String(r.Check_ID) : undefined,
      paymentResult:
        r.PaymentResult !== undefined && r.PaymentResult !== '' ? Number(r.PaymentResult) : undefined,
      resultCode,
      resultDescription: r.ResultDescription ? String(r.ResultDescription) : undefined,
      error: ok ? undefined : String(r.ResultDescription ?? `result=${resultCode}`),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function getInvoiceStatus(invoiceId: string): Promise<InvoiceStatusResult> {
  try {
    const parsed = await callECheck('InvoiceStatus', { Invoice_ID: invoiceId });
    const r = parsed?.InvoiceStatusResult ?? {};
    const resultCode = String(r.Result ?? '');
    const ok = resultCode === '0';
    return {
      ok,
      invoiceId: r.Invoice_ID ? String(r.Invoice_ID) : undefined,
      checkId: r.Check_ID ? String(r.Check_ID) : undefined,
      paymentResult:
        r.PaymentResult !== undefined && r.PaymentResult !== '' ? Number(r.PaymentResult) : undefined,
      paymentResultDescription: r.PaymentResultDescription
        ? String(r.PaymentResultDescription)
        : undefined,
      resultCode,
      resultDescription: r.ResultDescription ? String(r.ResultDescription) : undefined,
      error: ok ? undefined : String(r.ResultDescription ?? `result=${resultCode}`),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function cancelInvoice(invoiceId: string): Promise<SimpleResult> {
  try {
    const parsed = await callECheck('CancelInvoice', { Invoice_ID: invoiceId });
    const r = parsed?.CancelInvoiceResult ?? {};
    const code = String(r.Result ?? '');
    return {
      ok: code === '0',
      code,
      description: r.ResultDescription ? String(r.ResultDescription) : undefined,
      error: code === '0' ? undefined : String(r.ResultDescription ?? `result=${code}`),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function resendInvoiceNotification(invoiceId: string): Promise<SimpleResult> {
  try {
    const parsed = await callECheck('ResendInvoiceNotification', { Invoice_ID: invoiceId });
    const r = parsed?.ResendInvoiceNotificationResult ?? {};
    const code = String(r.Result ?? '');
    return {
      ok: code === '0',
      code,
      description: r.ResultDescription ? String(r.ResultDescription) : undefined,
      error: code === '0' ? undefined : String(r.ResultDescription ?? `result=${code}`),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function pullUnseenNotifications(): Promise<ClientNotification[]> {
  try {
    const parsed = await callENotification('UnseenNotifications', {});
    const r = parsed?.UnseenNotificationsResult ?? {};
    const raw = r.Notifications?.ClientNotification;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return arr.map((n) => ({
      id: Number(n.ClientNotification_ID),
      message: String(n.Message ?? ''),
      entryClientId: n.EntryClient_ID ? Number(n.EntryClient_ID) : null,
      timeCreated: n.timeCreated ? String(n.timeCreated) : null,
    }));
  } catch {
    return [];
  }
}

export async function clearNotification(id: number): Promise<SimpleResult> {
  try {
    const parsed = await callENotification('ClearNotification', {
      ClientNotification_ID: String(id),
    });
    const r = parsed?.ClearNotificationResult ?? {};
    const code = String(r.Result ?? '');
    return { ok: code === '0', code };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
