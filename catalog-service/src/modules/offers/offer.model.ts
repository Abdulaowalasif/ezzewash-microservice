import {
    Document,
    Model,
    Schema,
    Types,
    model,
} from "mongoose";

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
}

export enum OfferAudience {
    ALL_USERS = "ALL_USERS",
    SPECIFIC_USERS = "SPECIFIC_USERS",
}

export interface IOffer extends Document {
    branchId: Types.ObjectId;

    name: string;
    description?: string;

    audience: OfferAudience;

    discountType: DiscountType;
    discountValue: number;

    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;

    serviceIds: Types.ObjectId[];

    startAt: Date;
    endAt: Date;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const offerSchema =
    new Schema<IOffer>(
        {
            branchId: {
                type: Schema.Types.ObjectId,
                ref: "Branch",
                required: true,
            },

            name: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 100,
            },

            description: {
                type: String,
                trim: true,
                maxlength: 500,
            },

            audience: {
                type: String,
                enum: Object.values(
                    OfferAudience
                ),
                required: true,
            },

            discountType: {
                type: String,
                enum: Object.values(
                    DiscountType
                ),
                required: true,
            },

            discountValue: {
                type: Number,
                required: true,
                min: 0,
            },

            minimumOrderAmount: {
                type: Number,
                min: 0,
            },

            maximumDiscountAmount: {
                type: Number,
                min: 0,
            },

            serviceIds: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Service",
                },
            ],

            startAt: {
                type: Date,
                required: true,
            },

            endAt: {
                type: Date,
                required: true,
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

offerSchema.index({
    branchId: 1,
    isActive: 1,
});

offerSchema.index({
    startAt: 1,
    endAt: 1,
});

export const OfferModel: Model<IOffer> =
    model<IOffer>(
        "Offer",
        offerSchema
    );
