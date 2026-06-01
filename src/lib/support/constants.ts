// Support-ticket vocabulary. Client-safe (no server-only imports) so the chip
// islands + badge components can import these without pulling `next/headers`
// into the browser bundle — mirrors the project's *-constants.ts split.

export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'critical'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

// RUO-safe categories — no clinical / human-use language.
export const TICKET_CATEGORIES = [
  'general',
  'order_issue',
  'billing',
  'product_quality',
  'compliance',
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_customer: 'Awaiting reply',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  general: 'General question',
  order_issue: 'Order issue',
  billing: 'Billing',
  product_quality: 'Product / COA',
  compliance: 'Compliance / RUO',
};

// Tailwind badge classes per status (consumed by TicketStatusBadge).
export const TICKET_STATUS_BADGE: Record<string, string> = {
  open: 'bg-cl-teal/10 text-cl-teal',
  in_progress: 'bg-blue-50 text-blue-700',
  waiting_customer: 'bg-amber-50 text-amber-700',
  resolved: 'bg-cl-gray-100 text-cl-gray-600',
  closed: 'bg-cl-gray-100 text-cl-gray-500',
};

export const TICKET_PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-cl-gray-100 text-cl-gray-500',
  normal: 'bg-cl-gray-100 text-cl-gray-600',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
};

export function ticketStatusLabel(status: string): string {
  return TICKET_STATUS_LABELS[status] ?? status;
}

export function ticketPriorityLabel(priority: string): string {
  return TICKET_PRIORITY_LABELS[priority] ?? priority;
}

export function ticketCategoryLabel(category: string | null): string {
  if (!category) return '—';
  return TICKET_CATEGORY_LABELS[category] ?? category;
}

// Tickets are rendered as SUP-{sequential number}.
export function formatTicketNumber(n: number | null): string {
  return n == null ? '—' : `SUP-${n}`;
}
