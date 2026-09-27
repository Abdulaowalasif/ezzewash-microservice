import {
    Schema,
    model,
    type Document,
} from "mongoose";

export interface IOrderItem extends Document {
    orderId: string;
    serviceId: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema =
    new Schema<IOrderItem>(
        {
            orderId: {
                type: String,
                required: true,
            },

            serviceId: {
                type: String,
                required: true,
            },

            itemId: {
                type: String,
                required: true,
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            unitPrice: {
                type: Number,
                required: true,
                min: 0,
            },

            totalPrice: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        {
            timestamps: true,
        }
    );

orderItemSchema.index({
    orderId: 1,
});

export const OrderItem =
    model<IOrderItem>(
        "OrderItem",
        orderItemSchema
    );