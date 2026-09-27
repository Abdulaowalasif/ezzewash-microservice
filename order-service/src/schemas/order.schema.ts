import { z } from "zod";

export const createOrderSchema =
    z.object({
        branchId: z
            .string()
            .min(1),

        pickupSlot: z.object({
            date: z
                .string()
                .min(1),

            time: z
                .string()
                .min(1),
        }),

        deliverySlot: z.object({
            date: z
                .string()
                .min(1),

            time: z
                .string()
                .min(1),
        }),

        items: z
            .array(
                z.object({
                    serviceId: z
                        .string()
                        .min(1),

                    itemId: z
                        .string()
                        .min(1),

                    quantity: z
                        .number()
                        .int()
                        .min(1),
                })
            )
            .min(1),
    });

export const updateOrderStatusSchema =
    z.object({
        status: z.enum([
            "CONFIRMED",
            "PICKED_UP",
            "PROCESSING",
            "READY",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
        ]),
    });

export type UpdateOrderStatusInput =
    z.infer<typeof updateOrderStatusSchema>;

export type CreateOrderInput =
    z.infer<typeof createOrderSchema>;

export const orderPaginationSchema =
    z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(10),
    });

export type OrderPaginationInput =
    z.infer<typeof orderPaginationSchema>;

export const assignRiderSchema =
    z.object({
        riderId: z
            .string()
            .min(1),
    });

export type AssignRiderInput =
    z.infer<typeof assignRiderSchema>;
