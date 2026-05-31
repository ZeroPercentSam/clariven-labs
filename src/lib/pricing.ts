// RUO pricing model (Phase 2B / M2B.2).
//
// Retail = cost of goods + 300% markup = COGS * 4, per the Clariven internal
// pricing sheet (every SKU is exactly 4x). Admin-overridable per SKU; the
// admin pricing UI exposes a "recompute at 4x cost" bulk action built on this.
//
// cogs_cents is admin/finance only and never reaches a customer payload — see
// list_public_prices() (migration 0007) + tests/e2e/price-cost-leak.spec.ts.

export const RUO_MARKUP_MULTIPLIER = 4;

/** Retail price in cents for a given cost of goods (cost + 300%). */
export function retailFromCogs(cogsCents: number): number {
  return Math.round(cogsCents * RUO_MARKUP_MULTIPLIER);
}

/** Gross margin in cents (retail − cost), or null when cost is unknown. */
export function marginCents(priceCents: number | null, cogsCents: number | null): number | null {
  if (priceCents == null || cogsCents == null) return null;
  return priceCents - cogsCents;
}

/** Gross margin as a percentage of retail, or null when it can't be computed. */
export function marginPct(priceCents: number | null, cogsCents: number | null): number | null {
  if (priceCents == null || cogsCents == null || priceCents <= 0) return null;
  return ((priceCents - cogsCents) / priceCents) * 100;
}
