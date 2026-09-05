import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z ]+$/,
      "Full name can contain only letters and spaces"
    ),

  userName: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can contain only letters, numbers, and underscores"
    ),

  email: z
    .email("Please provide a valid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password cannot exceed 32 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#_!]{6,32}$/,
      "Password must contain at least one letter and one number"
    ),
});

export const loginSchema = z.object({
  email: z.email(),

  password: z.string().min(1, "Password is required"),
});