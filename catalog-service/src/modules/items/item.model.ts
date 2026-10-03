import {
    Document,
    Model,
    Schema,
    model,
} from "mongoose";

export interface IItem extends Document {
    name: string;
    code: string;
    description?: string;
    imageUrl?: string;
    displayOrder: number;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const itemSchema =
    new Schema<IItem>(
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

export const ItemModel: Model<IItem> =
    model<IItem>(
        "Item",
        itemSchema
    );