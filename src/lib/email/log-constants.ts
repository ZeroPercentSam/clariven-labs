// Phase 1 — client-safe constants for the email-log surface.
//
// Split into its own file (no 'server-only', no server imports) so the admin
// email-log client island can import EmailKind / labels without dragging
// next/headers into the client bundle. EMAIL_KINDS grows as later phases land
// (rep invitations, org, support); Phase 1 ships the order lifecycle set.

export const EMAIL_KINDS = [
  'order-placed',
  'order-paid',
  'order-shipped',
  'lot-expiration-warning',
  'contact-lead',
] as const;

export type EmailKind = (typeof EMAIL_KINDS)[number];

export const EMAIL_STATUSES = ['sent', 'error', 'suppressed'] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export const EMAIL_LOG_STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'error', label: 'Error' },
  { key: 'suppressed', label: 'Suppressed' },
] as const;
export type EmailLogStatusFilter = (typeof EMAIL_LOG_STATUS_FILTERS)[number]['key'];

export const EMAIL_LOG_KIND_LABELS: Record<EmailKind, string> = {
  'order-placed': 'Order placed',
  'order-paid': 'Order paid',
  'order-shipped': 'Order shipped',
  'lot-expiration-warning': 'Lot expiration warning',
  'contact-lead': 'Contact / lead',
};
