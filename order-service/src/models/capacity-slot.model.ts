import {
    Schema,
    model,
    type Document,
} from "mongoose";

export type CapacitySlotType =
    | "PICKUP"
    | "DELIVERY";

export interface ICapacitySlot
    extends Document {
    branchId: string;
    date: string;
    time: string;
    type: CapacitySlotType;
    capacity: number;
    booked: number;
    createdAt: Date;
    updatedAt: Date;
}

const capacitySlotSchema =
    new Schema<ICapacitySlot>(
        {
            branchId: {
                type: String,
                required: true,
                index: true,
            },

            date: {
                type: String,
                required: true,
            },

            time: {
                type: String,
                required: true,
            },

            type: {
                type: String,
                enum: [
                    "PICKUP",
                    "DELIVERY",
                ],
                required: true,
            },

            capacity: {
                type: Number,
                required: true,
                min: 1,
            },

            booked: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },
        },
        {
            timestamps: true,
        }
    );

capacitySlotSchema.index(
    {
        branchId: 1,
        date: 1,
        time: 1,
        type: 1,
    },
    {
        unique: true,
    }
);

export const CapacitySlot =
    model<ICapacitySlot>(
        "CapacitySlot",
        capacitySlotSchema
    );
