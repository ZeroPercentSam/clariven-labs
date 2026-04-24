import { z } from 'zod';

export const adminOrderPatchSchema = z.object({
  status: z
    .enum([
      'pending_payment',
      'processing',
      'paid',
      'preparing',
      'shipped',
      'delivered',
      'cancelled',
      'failed',
    ])
    .optional(),
  tracking_carrier: z.string().max(100).nullable().optional(),
  tracking_number: z.string().max(100).nullable().optional(),
  notes_internal: z.string().max(5000).nullable().optional(),
});
export type AdminOrderPatch = z.infer<typeof adminOrderPatchSchema>;
