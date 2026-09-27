import { z } from "zod";

export const createCapacitySlotSchema =
    z.object({
        branchId: z
            .string()
            .min(1),

        date: z
            .string()
            .min(1),

        time: z
            .string()
            .min(1),

        type: z.enum([
            "PICKUP",
            "DELIVERY",
        ]),

        capacity: z
            .number()
            .int()
            .min(1),
    });

export type CreateCapacitySlotInput =
    z.infer<
        typeof createCapacitySlotSchema
    >;

export const availableCapacitySlotSchema =
    z.object({
        branchId: z
            .string()
            .min(1),

        date: z
            .string()
            .min(1),

        type: z.enum([
            "PICKUP",
            "DELIVERY",
        ]),
    });

export type AvailableCapacitySlotInput =
    z.infer<
        typeof availableCapacitySlotSchema
    >;
