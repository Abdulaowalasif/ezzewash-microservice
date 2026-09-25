import { z } from "zod";

export const updateAddressSchema = z
    .object({
        label: z
            .enum(["HOME", "WORK", "OTHER"])
            .optional(),

        addressLine1: z
            .string()
            .trim()
            .min(3, "Address line 1 is required")
            .max(200, "Address line 1 is too long")
            .optional(),

        addressLine2: z
            .string()
            .trim()
            .max(200, "Address line 2 is too long")
            .nullable()
            .optional(),

        city: z
            .string()
            .trim()
            .min(2, "City is required")
            .max(100, "City is too long")
            .optional(),

        state: z
            .string()
            .trim()
            .max(100, "State is too long")
            .nullable()
            .optional(),

        postalCode: z
            .string()
            .trim()
            .max(20, "Postal code is too long")
            .nullable()
            .optional(),

        country: z
            .string()
            .trim()
            .min(2, "Country is required")
            .max(100, "Country is too long")
            .optional(),

        location: z
            .object({
                latitude: z.number().min(-90).max(90),
                longitude: z.number().min(-180).max(180),
            })
            .nullable()
            .optional(),

        isDefault: z.boolean().optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required",
        }
    );

export type UpdateAddressInput = z.infer<
    typeof updateAddressSchema
>;