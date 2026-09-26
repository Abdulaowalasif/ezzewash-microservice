import { z } from "zod";

export const createServiceItemSchema = z.object({
    serviceId: z
        .string()
        .trim()
        .min(1, "Service ID is required"),

    itemId: z
        .string()
        .trim()
        .min(1, "Item ID is required"),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    currency: z
        .string()
        .trim()
        .length(3, "Currency must be a 3-letter code")
        .transform((value) => value.toUpperCase())
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const updateServiceItemSchema = z.object({
    price: z
        .number()
        .min(0, "Price cannot be negative")
        .optional(),

    currency: z
        .string()
        .trim()
        .length(3, "Currency must be a 3-letter code")
        .transform((value) => value.toUpperCase())
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});

export type CreateServiceItemInput =
    z.infer<typeof createServiceItemSchema>;

export type UpdateServiceItemInput =
    z.infer<typeof updateServiceItemSchema>;