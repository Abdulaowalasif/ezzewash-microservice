import {
    Document,
    Model,
    Schema,
    Types,
    model,
} from "mongoose";

export interface IServiceItem extends Document {
    serviceId: Types.ObjectId;
    itemId: Types.ObjectId;

    price: number;
    currency: string;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const serviceItemSchema =
    new Schema<IServiceItem>(
        {
            serviceId: {
                type: Schema.Types.ObjectId,
                ref: "Service",
                required: true,
                index: true,
            },

            itemId: {
                type: Schema.Types.ObjectId,
                ref: "Item",
                required: true,
                index: true,
            },

            price: {
                type: Number,
                required: true,
                min: 0,
            },

            currency: {
                type: String,
                required: true,
                default: "BDT",
                uppercase: true,
                trim: true,
            },

            isActive: {
                type: Boolean,
                default: true,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

serviceItemSchema.index(
    {
        serviceId: 1,
        itemId: 1,
    },
    {
        unique: true,
    }
);

export const ServiceItemModel: Model<IServiceItem> =
    model<IServiceItem>(
        "ServiceItem",
        serviceItemSchema
    );