import { z } from "zod";

export const serviceItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  durationInMinutes: z.number().int().positive("Must be a positive integer"),
  price: z.number().positive("Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  id: z.string().uuid().optional(),
});

export const serviceSchema = z.union([
  serviceItemSchema,
  z.array(serviceItemSchema).min(1),
]);

export type ServiceSchema = z.infer<typeof serviceSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;
