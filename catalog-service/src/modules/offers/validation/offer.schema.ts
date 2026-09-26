import { z } from "zod";

import {
    DiscountType,
    OfferAudience,
} from "../offer.model.js";

const offerBaseSchema = z.object({
    branchId: z
        .string()
        .trim()
        .min(1, "Branch ID is required"),

    name: z
        .string()
        .trim()
        .min(
            2,
            "Offer name must be at least 2 characters"
        )
        .max(
            100,
            "Offer name must not exceed 100 characters"
        ),

    description: z
        .string()
        .trim()
        .max(
            500,
            "Description must not exceed 500 characters"
        )
        .optional(),

    audience: z.enum(OfferAudience),

    discountType: z.enum(DiscountType),

    discountValue: z
        .number()
        .positive(
            "Discount value must be greater than 0"
        ),

    minimumOrderAmount: z
        .number()
        .min(
            0,
            "Minimum order amount cannot be negative"
        )
        .optional(),

    maximumDiscountAmount: z
        .number()
        .min(
            0,
            "Maximum discount amount cannot be negative"
        )
        .optional(),

    serviceIds: z
        .array(
            z.string().trim().min(1)
        )
        .default([]),

    startAt: z.coerce.date(),

    endAt: z.coerce.date(),

    isActive: z
        .boolean()
        .optional(),
});

export const createOfferSchema =
    offerBaseSchema.superRefine(
        (data, ctx) => {
            if (data.endAt <= data.startAt) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endAt"],
                    message:
                        "End date must be after start date",
                });
            }

            if (
                data.discountType ===
                DiscountType.PERCENTAGE &&
                data.discountValue > 100
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["discountValue"],
                    message:
                        "Percentage discount cannot exceed 100",
                });
            }

            if (
                data.discountType ===
                DiscountType.FIXED &&
                data.maximumDiscountAmount !==
                undefined
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: [
                        "maximumDiscountAmount",
                    ],
                    message:
                        "Maximum discount amount is only applicable to percentage discounts",
                });
            }
        }
    );

const updateOfferBaseSchema =
    offerBaseSchema
        .omit({
            branchId: true,
        })
        .partial();

export const updateOfferSchema =
    updateOfferBaseSchema.superRefine(
        (data, ctx) => {
            if (
                data.startAt &&
                data.endAt &&
                data.endAt <= data.startAt
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endAt"],
                    message:
                        "End date must be after start date",
                });
            }

            if (
                data.discountType ===
                DiscountType.PERCENTAGE &&
                data.discountValue !== undefined &&
                data.discountValue > 100
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["discountValue"],
                    message:
                        "Percentage discount cannot exceed 100",
                });
            }

            if (
                data.discountType ===
                DiscountType.FIXED &&
                data.maximumDiscountAmount !==
                undefined
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: [
                        "maximumDiscountAmount",
                    ],
                    message:
                        "Maximum discount amount is only applicable to percentage discounts",
                });
            }
        }
    );

export const updateOfferStatusSchema =
    z.object({
        isActive: z.boolean(),
    });

export type CreateOfferInput =
    z.infer<typeof createOfferSchema>;

export type UpdateOfferInput =
    z.infer<typeof updateOfferSchema>;
