import { z } from "zod";

export const Appointment = z.object({
  id: z.string().uuid().optional(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  quotedPrice: z.number().nonnegative(),
  receivedPrice: z.number().nonnegative(),
  customerName: z.string().min(1),
  customerMobile: z.string().min(6),
  customerAddress: z.string().min(1),
  customerEmail: z.string().email(),

  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const appointmentSchema = z.object({
  serviceId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerMobile: z.string().min(6),
  customerAddress: z.string().min(1),
  quotedPrice: z.number().nonnegative(),
  receivedPrice: z.number().optional().nullable(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time",
  }),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export type AppointmentItem = z.infer<typeof Appointment>;
