import { z } from "zod";

export const verifyResetOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export type VerifyResetOtpInput = z.infer<
    typeof verifyResetOtpSchema
>;