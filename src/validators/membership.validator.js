import z from "zod";

export const createMembershipSchema = z.object({
 
     purchaseId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid purchase ID"
    ),

  cardNumber: z
    .string()
    .trim()
    .min(1, "Card number is required"),

  startDate: z.coerce.date({
    error: "Invalid start date",
  }),

  endDate: z.coerce.date({
    error: "Invalid end date",
  }),

  status: z
    .enum(["active", "expired", "suspended"])
    .default("active"),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const updateMembershipSchema = z.object({
  startDate: z.coerce.date({
    error: "Invalid start date",
  }),

  endDate: z.coerce.date({
    error: "Invalid end date",
  }),

  status: z.enum([
    "active",
    "expired",
    "suspended",
  ]),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);