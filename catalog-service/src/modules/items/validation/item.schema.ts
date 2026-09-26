import { z } from "zod";

export const createItemSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Item name must be at least 2 characters")
        .max(100, "Item name must not exceed 100 characters"),

    code: z
        .string()
        .trim()
        .min(2, "Item code must be at least 2 characters")
        .max(30, "Item code must not exceed 30 characters")
        .transform((value) => value.toUpperCase()),

    description: z
        .string()
        .trim()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const updateItemSchema =
    createItemSchema.partial();

export const updateItemStatusSchema =
    z.object({
        isActive: z.boolean(),
    });

export type CreateItemInput =
    z.infer<typeof createItemSchema>;

export type UpdateItemInput =
    z.infer<typeof updateItemSchema>;

export type UpdateItemStatusInput =
    z.infer<typeof updateItemStatusSchema>;