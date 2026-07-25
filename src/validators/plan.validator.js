import { z } from "zod";

export const planValidationSchema = z.object({
  image: z
    .string()
    .trim()
    .url("Please provide a valid image URL."),

  name: z
    .string()
    .trim()
    .min(3, "Plan name must be at least 3 characters.")
    .max(100),

  duration: z
    .string()
    .trim()
    .min(1, "Duration is required."),

  type: z.enum(["premium", "normal"]),

  subscriptionCharge: z.coerce
    .number()
    .min(0, "Subscription charge cannot be negative."),

  enrollmentCharge: z.coerce
    .number()
    .min(0, "Enrollment charge cannot be negative."),

  usage: z
    .array(z.string().trim())
    .min(1, "At least one equipment must be provided."),

  restriction: z.array(z.string().trim()).optional().default([]),

  treadmillUsageTime: z
    .string()
    .trim()
    .min(1, "Treadmill usage time is required."),

  gender: z.enum(["male", "female", "both"]),
});

export const updatePlanSchema = planValidationSchema.partial();