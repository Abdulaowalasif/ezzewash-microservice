import { z } from "zod";

export const createServiceSchema = z.object({
    branchId: z
        .string()
        .trim()
        .min(1, "Branch ID is required"),

    name: z
        .string()
        .trim()
        .min(2, "Service name must be at least 2 characters")
        .max(100, "Service name must not exceed 100 characters"),

    code: z
        .string()
        .trim()
        .min(2, "Service code must be at least 2 characters")
        .max(30, "Service code must not exceed 30 characters")
        .transform((value) => value.toUpperCase()),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    imageUrl: z
        .string()
        .trim()
        .url("Must be a valid URL")
        .optional(),

    displayOrder: z
        .number()
        .int()
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const updateServiceSchema =
    createServiceSchema
        .omit({
            branchId: true,
        })
        .partial();

export const updateServiceStatusSchema =
    z.object({
        isActive: z.boolean(),
    });

export type CreateServiceInput =
    z.infer<typeof createServiceSchema>;

export type UpdateServiceInput =
    z.infer<typeof updateServiceSchema>;

export type UpdateServiceStatusInput =
    z.infer<typeof updateServiceStatusSchema>;