import { z } from 'zod';

export const affiliateUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200).optional().nullable(),
  commission_pct: z.number().min(0).max(100).optional().nullable(),
  active: z.boolean().optional(),
});

export const affiliateCodeUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  affiliate_id: z.string().uuid(),
  code: z.string().min(1).max(32).regex(/^[A-Z0-9_-]+$/i),
  discount_pct: z.number().min(0).max(100),
  active: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable(),
});
