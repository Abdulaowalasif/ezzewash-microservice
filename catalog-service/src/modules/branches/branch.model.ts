import {
    Document,
    Model,
    Schema,
    model,
} from "mongoose";

export interface IBranch extends Document {
    name: string;
    code: string;
    description?: string;
    imageUrl?: string;

    address: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state?: string;
        postalCode?: string;
        country: string;
    };

    phone?: string;
    email?: string;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const branchSchema =
    new Schema<IBranch>(
        {
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
                unique: true,
                uppercase: true,
                trim: true,
                minlength: 2,
                maxlength: 20,
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

            address: {
                addressLine1: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 200,
                },

                addressLine2: {
                    type: String,
                    trim: true,
                    maxlength: 200,
                },

                city: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 100,
                },

                state: {
                    type: String,
                    trim: true,
                    maxlength: 100,
                },

                postalCode: {
                    type: String,
                    trim: true,
                    maxlength: 20,
                },

                country: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 100,
                },
            },

            phone: {
                type: String,
                trim: true,
                maxlength: 20,
            },

            email: {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 255,
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

branchSchema.index({
    isActive: 1,
});

export const BranchModel: Model<IBranch> =
    model<IBranch>(
        "Branch",
        branchSchema
    );
