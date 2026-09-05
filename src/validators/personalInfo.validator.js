import { z } from "zod";

export const createPersonalInfoSchema = z.object({
  age: z
    .coerce
    .number()
    .int()
    .min(0, "Age cannot be negative")
    .optional(),

  weight: z
  .coerce
    .number()
    .min(0, "Weight cannot be negative")
    .optional(),

  height: z
  .coerce
    .number()
    .min(0, "Height cannot be negative")
    .optional(),

  goal: z
    .string()
    .trim()
    .max(300, "Goal cannot exceed 300 characters")
    .optional(),
});

export const updatePersonalInfoSchema =
  createPersonalInfoSchema.partial();