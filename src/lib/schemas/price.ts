import { z } from 'zod';

export const priceUpsertSchema = z.object({
  product_slug: z.string().min(1).max(120),
  strength_label: z.string().min(1).max(120),
  price_cents: z.number().int().min(0).max(10_000_000),
  // COGS per unit in cents (admin/finance only — never sent to customers).
  // Retail price_cents = cogs_cents * 4 (cost + 300% markup); admin-editable
  // to allow per-SKU overrides.
  cogs_cents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  active: z.boolean().optional(),
});

export type PriceUpsert = z.infer<typeof priceUpsertSchema>;
