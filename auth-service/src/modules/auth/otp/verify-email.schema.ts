import { z } from "zod";

export const verifyEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;