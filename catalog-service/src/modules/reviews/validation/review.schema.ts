import { z } from "zod";

export const createReviewSchema = z.object({
    serviceId: z
        .string()
        .trim()
        .min(1, "Service ID is required"),

    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1)
        .max(5),

    comment: z
        .string()
        .trim()
        .max(1000)
        .optional(),
});

export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1)
        .max(5)
        .optional(),

    comment: z
        .string()
        .trim()
        .max(1000)
        .optional(),
});

export type CreateReviewInput =
    z.infer<typeof createReviewSchema>;

export type UpdateReviewInput =
    z.infer<typeof updateReviewSchema>;