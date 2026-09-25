import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Current password is required"),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters")
            .max(72, "New password must not exceed 72 characters"),
    })
    .refine(
        (data) => data.currentPassword !== data.newPassword,
        {
            message:
                "New password must be different from current password",
            path: ["newPassword"],
        }
    );

export type ChangePasswordInput =
    z.infer<typeof changePasswordSchema>;