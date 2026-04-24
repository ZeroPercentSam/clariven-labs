// PaymentResult codes per Green.Money eDebit API v2.6 (page 117).
// 0 = Debit Processed (paid)
// 1 = Debit entered, but not yet processed (processing)
// 2 = Debit was deleted (cancelled)
// 3 = No payment yet entered for invoice (pending_payment)
export const GBP_PAYMENT_RESULT = {
  PAID: 0,
  PROCESSING: 1,
  DELETED: 2,
  PENDING: 3,
} as const;

export type GbpPaymentResult = (typeof GBP_PAYMENT_RESULT)[keyof typeof GBP_PAYMENT_RESULT];

export type CreateInvoiceArgs = {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  itemSummary: string; // description of contents
};

export type CreateInvoiceResult = {
  ok: boolean;
  invoiceId?: string;
  checkId?: string;
  paymentResult?: number;
  resultCode?: string;
  resultDescription?: string;
  error?: string;
};

export type InvoiceStatusResult = {
  ok: boolean;
  invoiceId?: string;
  checkId?: string;
  paymentResult?: number;
  paymentResultDescription?: string;
  resultCode?: string;
  resultDescription?: string;
  error?: string;
};

export type SimpleResult = { ok: boolean; code?: string; description?: string; error?: string };

export type ClientNotification = {
  id: number;
  message: string;
  entryClientId: number | null;
  timeCreated: string | null;
};
