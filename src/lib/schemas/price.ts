import { z } from 'zod';

export const priceUpsertSchema = z.object({
  product_slug: z.string().min(1).max(120),
  strength_label: z.string().min(1).max(120),
  price_cents: z.number().int().min(0).max(10_000_000),
  // COGS per unit in cents. Listed price reflects a 300% markup applied to
  // COGS, so cogs_cents should equal price_cents / 3 (admin-editable to allow
  // overrides for promo or volume pricing).
  cogs_cents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  active: z.boolean().optional(),
});

export type PriceUpsert = z.infer<typeof priceUpsertSchema>;
