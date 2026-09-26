import { z } from "zod";

const addressSchema = z.object({
    addressLine1: z
        .string()
        .trim()
        .min(2)
        .max(200),

    addressLine2: z
        .string()
        .trim()
        .max(200)
        .optional(),

    city: z
        .string()
        .trim()
        .min(2)
        .max(100),

    state: z
        .string()
        .trim()
        .max(100)
        .optional(),

    postalCode: z
        .string()
        .trim()
        .max(20)
        .optional(),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100),
});

export const createBranchSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    code: z
        .string()
        .trim()
        .min(2)
        .max(20)
        .transform((value) => value.toUpperCase()),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    address: addressSchema,

    phone: z
        .string()
        .trim()
        .max(20)
        .optional(),

    email: z
        .string()
        .trim()
        .email()
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const updateBranchSchema =
    createBranchSchema.partial();

export const updateBranchStatusSchema =
    z.object({
        isActive: z.boolean(),
    });

export type CreateBranchInput =
    z.infer<typeof createBranchSchema>;

export type UpdateBranchInput =
    z.infer<typeof updateBranchSchema>;

export type UpdateBranchStatusInput =
    z.infer<typeof updateBranchStatusSchema>;   