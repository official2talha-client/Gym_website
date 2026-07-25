import { z } from "zod";

export const exerciseValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Exercise name must be at least 2 characters.")
    .max(100),

  bodyPart: z
   .string()
    .trim()
    .min(2, "Body part is required."),


  targetMuscle: z
    .string()
    .trim()
    .min(2, "Target muscle is required."),

  secondaryMuscles: z
    .array(z.string().trim())
    .default([]),

  equipment: z
    .string()
    .trim()
    .min(2, "Equipment is required."),

  difficulty: z.enum([
    "beginner",
    "intermediate",
    "advanced",
  ]),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(1000)
    .optional(),

  thumbnail: z
    .string()
    .trim()
    .url("Please provide a valid thumbnail URL."),

  video: z
    .string()
    .trim()
    .url("Please provide a valid video URL."),

  duration: z
    .string()
    .trim()
    .optional(),
});