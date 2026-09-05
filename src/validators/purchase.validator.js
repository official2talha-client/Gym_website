import z from 'zod'

export const acceptPurchaseSchema = z.object({
  startDate: z.coerce.date({
    error: "Invalid start date",
  }),

  endDate: z.coerce.date({
    error: "Invalid end date",
  }),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);