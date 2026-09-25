import { Schema, model, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
    {
        label: {
            type: String,
            enum: ["HOME", "WORK", "OTHER"],
            default: "HOME",
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine2: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        postalCode: {
            type: String,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            latitude: {
                type: Number,
            },

            longitude: {
                type: Number,
            },
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        profilePicture: {
            type: String,
            default: null,
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },


        addresses: {
            type: [addressSchema],
            default: [],
        },


        role: {
            type: String,
            enum: ["USER", "ADMIN", "RIDER", "SUPER_ADMIN"],
            default: "USER",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);

userSchema.index({
    role: 1,
    isActive: 1,
});

export type User = InferSchemaType<typeof userSchema>;

export type UserDocument = import("mongoose").HydratedDocument<User>;

export type Address = InferSchemaType<typeof addressSchema>;

export const UserModel = model<User>("User", userSchema);