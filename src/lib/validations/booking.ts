import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    item_id: z.string().uuid(),
    start_date: z.string().min(1, "Startdatum erforderlich"),
    end_date: z.string().min(1, "Enddatum erforderlich"),
    message: z.string().max(500, "Nachricht zu lang").optional(),
  })
  .refine((d) => new Date(d.end_date) >= new Date(d.start_date), {
    message: "Enddatum darf nicht vor dem Startdatum liegen",
    path: ["end_date"],
  });

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
