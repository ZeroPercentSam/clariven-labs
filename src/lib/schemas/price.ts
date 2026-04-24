import { z } from 'zod';

export const priceUpsertSchema = z.object({
  product_slug: z.string().min(1).max(120),
  strength_label: z.string().min(1).max(120),
  price_cents: z.number().int().min(0).max(10_000_000),
  active: z.boolean().optional(),
});

export type PriceUpsert = z.infer<typeof priceUpsertSchema>;
