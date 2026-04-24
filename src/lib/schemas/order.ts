import { z } from 'zod';

export const shippingAddressSchema = z.object({
  full_name: z.string().min(1).max(200),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().default(''),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(40),
  postal_code: z.string().min(1).max(20),
  country: z.string().min(2).max(2).default('US'),
  phone: z.string().max(40).optional().default(''),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const orderItemInputSchema = z.object({
  product_slug: z.string().min(1).max(120),
  product_name: z.string().min(1).max(200),
  strength_label: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(99),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemInputSchema).min(1).max(50),
  shipping_address: shippingAddressSchema,
  affiliate_code: z.string().max(32).optional().nullable(),
});
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const messageCreateSchema = z.object({
  body: z.string().min(1).max(5000),
});
