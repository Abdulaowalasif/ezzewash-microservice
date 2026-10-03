import {
    Document,
    Model,
    Schema,
    model,
    Types,
} from "mongoose";

export interface IService extends Document {
    branchId: Types.ObjectId;

    name: string;
    code: string;

    description?: string;
    imageUrl?: string;
    displayOrder: number;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema =
    new Schema<IService>(
        {
            branchId: {
                type: Schema.Types.ObjectId,
                ref: "Branch",
                required: true,
                index: true,
            },

            name: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 100,
            },

            code: {
                type: String,
                required: true,
                trim: true,
                uppercase: true,
                minlength: 2,
                maxlength: 30,
            },

            description: {
                type: String,
                trim: true,
                maxlength: 500,
            },

            imageUrl: {
                type: String,
                trim: true,
            },

            displayOrder: {
                type: Number,
                default: 0,
            },

            isActive: {
                type: Boolean,
                default: true,
                index: true,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

serviceSchema.index(
    {
        branchId: 1,
        code: 1,
    },
    {
        unique: true,
    }
);

export const ServiceModel: Model<IService> =
    model<IService>(
        "Service",
        serviceSchema
    );