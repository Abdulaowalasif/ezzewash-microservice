import {
    Schema,
    model,
    type Document,
} from "mongoose";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "PROCESSING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export interface IOrderSlot {
    date: string;
    time: string;
}

export interface IOrder extends Document {
    riderId?: string;
    userId: string;
    branchId: string;
    pickupSlot: IOrderSlot;
    deliverySlot: IOrderSlot;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema =
    new Schema<IOrder>(
        {
            userId: {
                type: String,
                required: true,
                index: true,
            },

            riderId: {
                type: String,
                index: true,
            },

            branchId: {
                type: String,
                required: true,
                index: true,
            },

            pickupSlot: {
                type: {
                    date: {
                        type: String,
                        required: true,
                    },
                    time: {
                        type: String,
                        required: true,
                    },
                },
                required: true,
            },

            deliverySlot: {
                type: {
                    date: {
                        type: String,
                        required: true,
                    },
                    time: {
                        type: String,
                        required: true,
                    },
                },
                required: true,
            },

            status: {
                type: String,
                enum: [
                    "PENDING",
                    "CONFIRMED",
                    "PICKED_UP",
                    "PROCESSING",
                    "READY",
                    "OUT_FOR_DELIVERY",
                    "DELIVERED",
                    "CANCELLED",
                ],
                default: "PENDING",
                index: true,
            },

            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },

            discount: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },

            total: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        {
            timestamps: true,
        }
    );

orderSchema.index({
    branchId: 1,
    status: 1,
    createdAt: -1,
});

orderSchema.index({
    userId: 1,
    createdAt: -1,
});

export const Order = model<IOrder>(
    "Order",
    orderSchema
);
