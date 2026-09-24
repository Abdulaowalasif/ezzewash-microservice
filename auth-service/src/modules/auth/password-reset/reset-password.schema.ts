import { z } from "zod";

export const resetPasswordSchema = z.object({
    resetToken: z
        .string()
        .min(1, "Reset token is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must not exceed 72 characters"),
});

export type ResetPasswordInput = z.infer<
    typeof resetPasswordSchema
>;