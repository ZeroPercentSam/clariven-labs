import { z } from 'zod';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/support/constants';

// Customer ticket creation. order_id is optional and may arrive as '' from an
// unselected <select> — coerce empty to undefined.
export const ticketCreateSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(200),
  body: z.string().trim().min(10, 'Describe your request in at least 10 characters.').max(4000),
  category: z.enum(TICKET_CATEGORIES).optional(),
  order_id: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;

// Reply to a ticket. is_internal arrives as a checkbox value ('on') or boolean;
// the action only honors it when the caller is a real admin.
export const ticketReplySchema = z.object({
  body: z.string().trim().min(1, 'Write a reply.').max(4000),
  is_internal: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => v === true || v === 'on' || v === 'true'),
});
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;

// Admin status / priority transitions.
export const ticketStatusSchema = z.object({ status: z.enum(TICKET_STATUSES) });
export const ticketPrioritySchema = z.object({ priority: z.enum(TICKET_PRIORITIES) });
