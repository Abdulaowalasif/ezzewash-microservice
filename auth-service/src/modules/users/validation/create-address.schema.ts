import { z } from "zod";

export const createAddressSchema = z.object({
    label: z
        .enum(["HOME", "WORK", "OTHER"])
        .default("HOME"),

    addressLine1: z
        .string()
        .trim()
        .min(3, "Address line 1 is required")
        .max(200, "Address line 1 is too long"),

    addressLine2: z
        .string()
        .trim()
        .max(200, "Address line 2 is too long")
        .optional(),

    city: z
        .string()
        .trim()
        .min(2, "City is required")
        .max(100, "City is too long"),

    state: z
        .string()
        .trim()
        .max(100, "State is too long")
        .optional(),

    postalCode: z
        .string()
        .trim()
        .max(20, "Postal code is too long")
        .optional(),

    country: z
        .string()
        .trim()
        .min(2, "Country is required")
        .max(100, "Country is too long"),

    location: z
        .object({
            latitude: z
                .number()
                .min(-90)
                .max(90),

            longitude: z
                .number()
                .min(-180)
                .max(180),
        })
        .optional(),

    isDefault: z
        .boolean()
        .default(false),
});

export type CreateAddressInput = z.infer<
    typeof createAddressSchema
>;