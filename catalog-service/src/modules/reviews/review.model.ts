import {
    Document,
    Model,
    Schema,
    Types,
    model,
} from "mongoose";

export interface IReview extends Document {
    userId: Types.ObjectId;
    serviceId: Types.ObjectId;

    rating: number;
    comment?: string;

    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema =
    new Schema<IReview>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
            },

            serviceId: {
                type: Schema.Types.ObjectId,
                ref: "Service",
                required: true,
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },

            comment: {
                type: String,
                trim: true,
                maxlength: 1000,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

reviewSchema.index(
    {
        userId: 1,
        serviceId: 1,
    },
    {
        unique: true,
    }
);

reviewSchema.index({
    serviceId: 1,
    createdAt: -1,
});

export const ReviewModel: Model<IReview> =
    model<IReview>(
        "Review",
        reviewSchema
    );