import mongoose from "mongoose";
import { UserModel, type User, type UserDocument } from "./user.model.js";

export class UserRepository {
    async create(data: Partial<User>): Promise<UserDocument> {
        return UserModel.create(data);
    }

    async findById(id: string): Promise<UserDocument | null> {
        return UserModel.findById(id).exec();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return UserModel.findOne({ email }).exec();
    }

    async findByPhone(phone: string): Promise<UserDocument | null> {
        return UserModel.findOne({ phone }).exec();
    }
    async markEmailVerified(email: string): Promise<UserDocument | null> {
        return UserModel.findOneAndUpdate(
            { email },
            { $set: { isEmailVerified: true } },
            { new: true }
        ).exec();
    }

    async updatePassword(
        email: string,
        passwordHash: string
    ): Promise<UserDocument | null> {
        return UserModel.findOneAndUpdate(
            { email },
            { $set: { passwordHash } },
            { new: true }
        )
            .select("+passwordHash")
            .exec();
    }

    async findByEmailWithPassword(email: string) {
        return UserModel.findOne({ email })
            .select("+passwordHash")
            .exec();
    }


    async updateProfile(
        userId: string,
        data: {
            firstName?: string | undefined;
            lastName?: string | undefined;
            phone?: string | undefined;
            profilePicture?: string | null | undefined;
            dateOfBirth?: Date | null | undefined;
        }
    ): Promise<UserDocument | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            {
                $set: data,
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();
    }


    async addAddress(
        userId: string,
        address: {
            label?: "HOME" | "WORK" | "OTHER" | undefined;
            addressLine1: string;
            addressLine2?: string | undefined;
            city: string;
            state?: string | undefined;
            postalCode?: string | undefined;
            country: string;
            location?: {
                latitude: number;
                longitude: number;
            } | undefined;
            isDefault?: boolean | undefined;
        }
    ): Promise<UserDocument | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            {
                $push: {
                    addresses: address,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();
    }

    async clearDefaultAddress(
        userId: string
    ): Promise<void> {
        await UserModel.updateOne(
            { _id: userId },
            {
                $set: {
                    "addresses.$[].isDefault": false,
                },
            }
        ).exec();
    }

    async getAddresses(
        userId: string
    ): Promise<User["addresses"] | null> {
        const user = await UserModel.findById(
            userId
        )
            .select("addresses")
            .lean()
            .exec();

        if (!user) {
            return null;
        }

        return user.addresses;
    }


    async updateAddress(
        userId: string,
        addressId: string,
        data: {
            label?: "HOME" | "WORK" | "OTHER" | undefined;
            addressLine1?: string | undefined;
            addressLine2?: string | null | undefined;
            city?: string | undefined;
            state?: string | null | undefined;
            postalCode?: string | null | undefined;
            country?: string | undefined;
            location?: {
                latitude: number;
                longitude: number;
            } | null | undefined;
            isDefault?: boolean | undefined;
        }
    ): Promise<UserDocument | null> {
        return UserModel.findOneAndUpdate(
            {
                _id: userId,
                "addresses._id": addressId,
            },
            {
                $set: Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [
                        `addresses.$.${key}`,
                        value,
                    ])
                ),
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();
    }

    async deleteAddress(
        userId: string,
        addressId: string
    ): Promise<UserDocument | null> {
        return UserModel.findOneAndUpdate(
            {
                _id: userId,
                "addresses._id": addressId,
            },
            {
                $pull: {
                    addresses: {
                        _id: addressId,
                    },
                },
            },
            {
                new: true,
            }
        ).exec();
    }

    async setDefaultAddress(
        userId: string,
        addressId: string
    ): Promise<UserDocument | null> {
        return UserModel.findOneAndUpdate(
            {
                _id: userId,
                "addresses._id": addressId,
            },
            [
                {
                    $set: {
                        addresses: {
                            $map: {
                                input: "$addresses",
                                as: "address",
                                in: {
                                    $mergeObjects: [
                                        "$$address",
                                        {
                                            isDefault: {
                                                $eq: [
                                                    "$$address._id",
                                                    new mongoose.Types.ObjectId(addressId),
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            ],
            {
                new: true,
                updatePipeline: true,
            }
        ).exec();
    }


    async findByIdWithPassword(
        userId: string
    ): Promise<UserDocument | null> {
        return UserModel.findById(userId)
            .select("+passwordHash")
            .exec();
    }

    async updatePasswordById(
        userId: string,
        passwordHash: string
    ): Promise<UserDocument | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    passwordHash,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .select("+passwordHash")
            .exec();
    }

    async updateUserStatus(
        userId: string,
        isActive: boolean
    ): Promise<UserDocument | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isActive,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();
    }

    async deleteById(
        userId: string
    ): Promise<UserDocument | null> {
        return UserModel.findByIdAndDelete(userId).exec();
    }

}