import { z } from "zod";

// offline 
export const offlineMembershipSchema = z
  .object({
    user: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),

    plan: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid plan ID"),

    cardNumber: z
      .string()
      .min(1, "Membership card number is required")
      .trim(),

    startDate: z.coerce.date({
      error: "Invalid start date",
    }),

    endDate: z.coerce.date({
      error: "Invalid end date",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

  // online 
  export const createMembershipFromPurchaseSchema = z
  .object({
    purchaseId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid purchase ID"),

       cardNumber: z
      .string()
      .optional(),

    startDate: z.coerce.date({
      error: "Invalid start date",
    }),

    endDate: z.coerce.date({
      error: "Invalid end date",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

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