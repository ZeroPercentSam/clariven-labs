// Client-safe order-request constants (no 'server-only') — shared by UI + actions.

export const ORDER_REQUEST_STATUSES = [
  'submitted',
  'in_review',
  'sourced',
  'fulfilled',
  'cancelled',
] as const;
export type OrderRequestStatus = (typeof ORDER_REQUEST_STATUSES)[number];

export const ORDER_REQUEST_STATUS_LABELS: Record<OrderRequestStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  sourced: 'Sourced',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export const ORDER_REQUEST_STATUS_STYLES: Record<OrderRequestStatus, string> = {
  submitted: 'bg-cl-blue/10 text-cl-blue',
  in_review: 'bg-cl-gold/10 text-cl-gold',
  sourced: 'bg-cl-teal/10 text-cl-teal',
  fulfilled: 'bg-cl-success/10 text-cl-success',
  cancelled: 'bg-cl-error/10 text-cl-error',
};

export const ORDER_REQUEST_KIND_LABELS: Record<'initial' | 'reorder', string> = {
  initial: 'Initial order',
  reorder: 'Reorder',
};

/** Research-code slug → display label (e.g. "triple-regulator" → "Triple Regulator"). */
export function prettifyProductName(slug: string): string {
  return slug
    .split('-')
    .map((w) => (/^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
