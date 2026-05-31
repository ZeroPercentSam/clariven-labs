// Audit-log viewer constants. Client-safe (no server-only imports) so a future
// client filter island can import these without pulling `next/headers` into the
// browser bundle. The page is currently a server component, but keeping the
// vocabulary here mirrors the project's chip-filter-constants split convention.

// Every distinct `target_type` written to admin_audit_log today (Phases 1–4).
// Used to render the target-type filter chips. New writers should add their
// target_type here so it becomes filterable.
export const AUDIT_TARGET_TYPES = [
  'order',
  'organization',
  'sales_rep',
  'rep_org_assignment',
  'rep_commission',
  'rep_commission_batch',
  'rep_invitation',
  'affiliate',
  'affiliate_code',
  'product_price',
] as const;

export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number];

// Humanised labels for the chips. Falls back to the raw value if absent.
export const AUDIT_TARGET_LABELS: Record<string, string> = {
  order: 'Orders',
  organization: 'Organizations',
  sales_rep: 'Reps',
  rep_org_assignment: 'Rep assignments',
  rep_commission: 'Commissions',
  rep_commission_batch: 'Payout batches',
  rep_invitation: 'Rep invites',
  affiliate: 'Affiliates',
  affiliate_code: 'Affiliate codes',
  product_price: 'Pricing',
};

export function auditTargetLabel(targetType: string): string {
  return AUDIT_TARGET_LABELS[targetType] ?? targetType;
}
