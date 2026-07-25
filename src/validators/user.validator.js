import { z } from "zod";

export const userValidationSchema = z.object({

    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters.")
        .max(100)
        .regex(
            /^[a-zA-Z ]+$/,
            "Full name can contain only letters and spaces."
        ),

    userName: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can contain only letters, numbers and underscore (_)."
        ),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email."),
        

    password: z
        .string()
        .min(6)
        .max(32)
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#_!]+$/,
            "Password must contain at least one letter and one number."
        ),

    age: z
    .coerce
        .number()
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

    role: z
        .enum(["admin", "user"])
        .optional(),

    status: z
        .enum(["active", "blocked"])
        .optional(),

    refreshToken: z
        .string()
        .optional(),

});