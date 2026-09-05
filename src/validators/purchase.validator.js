import z from "zod";

export const rejectPurchaseSchema = z.object({
  status: z.enum(["rejected"], {
    error: "Status must be rejected",
  }),
});