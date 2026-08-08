import { z } from "zod";

export const trainerValidationSchema = z.object({


  name: z
    .string()
    .trim()
    .min(3, "Trainer name must be at least 3 characters.")
    .max(100),

  shift: z.enum(["morning", "evening", "full-day"]),

  timeRange: z
    .string()
    .trim()
    .min(3, "Time range is required."),

  achievements: z
    .array(z.string().trim())
    .default([]),

  age: z.coerce
    .number()
    .min(18, "Trainer must be at least 18 years old.")
    .max(80, "Invalid age."),

  gender: z.enum(["male", "female"]),

  experience: z.coerce
  .number()
  .min(0, "Experience cannot be negative."),
});

export const updateTrainerSchema = trainerValidationSchema.partial();