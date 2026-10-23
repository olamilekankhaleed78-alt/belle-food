import { z } from "zod";

export const menuInputSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(6).max(1200),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  priceNaira: z.number().positive().max(100000000),
  imagePath: z.string().url().or(z.string().startsWith("/uploads/")),
  isSpicy: z.boolean().optional().default(false),
  isVegan: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
});

export const orderPayloadSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(7).max(40),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  notes: z.string().max(500).optional().default(""),
  items: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "preparing", "dispatched", "completed", "cancelled"]),
});

export const settingsSchema = z.object({
  kitchenWhatsApp: z.string().max(40).optional(),
  serviceFeeNaira: z.number().min(0).max(1000000).optional(),
});
