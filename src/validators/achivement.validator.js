import { z } from "zod";

export const createAchievementSchema = z.object({
  month: z
    .string()
    .trim()
    .min(1, "Month is required"),

  description: z
    .string()
    .trim()
    .min(5, "Description is required")
    .max(500, "Description cannot exceed 500 characters"),

  date: z.coerce.date().optional(),
});

export const updateAchievementSchema =
  createAchievementSchema.partial();