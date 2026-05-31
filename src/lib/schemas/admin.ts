import { z } from 'zod';

export const ORDER_STATUSES = [
  'pending_payment',
  'processing',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
] as const;

export const adminOrderPatchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  tracking_carrier: z.string().max(100).nullable().optional(),
  tracking_number: z.string().max(100).nullable().optional(),
  notes_internal: z.string().max(5000).nullable().optional(),
});
export type AdminOrderPatch = z.infer<typeof adminOrderPatchSchema>;

// Bulk status change for /api/admin/orders/bulk. Capped at 200 to match the
// admin orders list .limit(200) — you can only select what's on screen.
export const adminOrderBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  status: z.enum(ORDER_STATUSES),
});
export type AdminOrderBulk = z.infer<typeof adminOrderBulkSchema>;
