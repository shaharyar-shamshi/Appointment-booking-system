import z from "zod";

export const availabilityQuerySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  serviceId: z.string().uuid(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
