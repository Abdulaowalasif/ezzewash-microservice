import { z } from "zod";

export const createRiderSchema = z.object({
    firstName: z.string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters"),

    lastName: z.string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters"),

    email: z.string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    phone: z.string()
        .trim()
        .min(10, "Invalid phone number")
        .max(20, "Invalid phone number"),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must not exceed 72 characters"),
});

export type CreateRiderInput =
    z.infer<typeof createRiderSchema>;