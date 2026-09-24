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

}