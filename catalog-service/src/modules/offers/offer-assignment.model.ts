import {
    Document,
    Model,
    Schema,
    Types,
    model,
} from "mongoose";

export interface IOfferAssignment
    extends Document {
    offerId: Types.ObjectId;
    userId: Types.ObjectId;

    assignedAt: Date;

    isUsed: boolean;
    usedAt?: Date;

    expiresAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const offerAssignmentSchema =
    new Schema<IOfferAssignment>(
        {

            offerId: {
                type: Schema.Types.ObjectId,
                ref: "Offer",
                required: true,
            },

            userId: {
                type: Schema.Types.ObjectId,
                required: true,
            },

            assignedAt: {
                type: Date,
                default: Date.now,
                required: true,
            },

            isUsed: {
                type: Boolean,
                default: false,
                index: true,
            },

            usedAt: {
                type: Date,
            },

            expiresAt: {
                type: Date,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

offerAssignmentSchema.index(
    {
        offerId: 1,
        userId: 1,
    },
    {
        unique: true,
    }
);

offerAssignmentSchema.index({
    userId: 1,
    isUsed: 1,
});

export const OfferAssignmentModel:
    Model<IOfferAssignment> =
    model<IOfferAssignment>(
        "OfferAssignment",
        offerAssignmentSchema
    );
