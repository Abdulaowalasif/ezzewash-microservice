import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { UserRepository } from "./user.repository.js";
import type { User } from "./user.model.js";
import type { RegisterUserDto } from "./dto/register-user.dto.js";
import type { OtpService } from "../auth/otp/otp.service.js";
import {
    getResetToken,
    deleteResetToken,
} from "../auth/password-reset/reset-token.store.js";

import {
    saveRefreshToken,
    deleteRefreshTokensForUser,
} from "../auth/refresh-token/refresh-token.store.js";
import type { LoginUserDto } from "./dto/login-user.dto.js";
import { JwtService } from "../../infrastructure/jwt/jwt.service.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { UpdateProfileInput } from "./validation/update-user.schema.js";
import type { CreateAddressInput } from "./validation/create-address.schema.js";
import type { UpdateAddressInput } from "./validation/update-address.schema.js";
import type { ChangePasswordInput } from "./validation/change-password.schema.js";
import type { CreateAdminInput } from "./validation/create-admin.schema.js";
import type { CreateRiderInput } from "./validation/create-rider.schema.js";

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService
    ) { }

    async getUserById(
        id: string
    ): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async getUserByEmail(
        email: string
    ): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async register(
        data: RegisterUserDto
    ): Promise<User> {
        const existingEmail =
            await this.userRepository.findByEmail(
                data.email
            );

        if (existingEmail) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const existingPhone =
            await this.userRepository.findByPhone(
                data.phone
            );

        if (existingPhone) {
            throw new AppError(
                "Phone already exists",
                409
            );
        }

        const passwordHash =
            await bcrypt.hash(
                data.password,
                12
            );

        const user =
            await this.userRepository.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                passwordHash,
            });

        await this.otpService.sendEmailOtp(
            user.email
        );

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

    async resendVerificationOtp(
        email: string
    ): Promise<void> {
        const user =
            await this.userRepository.findByEmail(
                email
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified",
                409
            );
        }

        await this.otpService.sendEmailOtp(
            email
        );
    }

    async requestPasswordReset(
        email: string
    ): Promise<void> {
        const user =
            await this.userRepository.findByEmail(
                email
            );

        if (!user) {
            return;
        }

        if (!user.isActive) {
            return;
        }

        await this.otpService.sendPasswordResetOtp(
            email
        );
    }

    async resetPassword(
        resetToken: string,
        newPassword: string
    ): Promise<void> {
        const record =
            await getResetToken(
                resetToken
            );

        if (!record) {
            throw new AppError(
                "Reset token is invalid or expired",
                400
            );
        }

        const passwordHash =
            await bcrypt.hash(
                newPassword,
                12
            );

        const user =
            await this.userRepository.updatePassword(
                record.email,
                passwordHash
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        await deleteResetToken(
            resetToken
        );

        await deleteRefreshTokensForUser(
            user._id.toString()
        );
    }

    async login(
        data: LoginUserDto
    ): Promise<{
        user: Omit<User, "passwordHash">;
        accessToken: string;
        refreshToken: string;
    }> {
        const user1 =
            await this.userRepository.findByEmailWithPassword(
                data.email
            );

        if (!user1) {
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        if (!user1.isActive) {
            throw new AppError(
                "Account is inactive",
                403
            );
        }

        if (!user1.isEmailVerified) {
            throw new AppError(
                "Email is not verified",
                403
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                data.password,
                user1.passwordHash
            );

        if (!passwordMatches) {
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        const {
            passwordHash: _passwordHash,
            ...user
        } = user1.toObject();

        const accessToken =
            this.jwtService.generateAccessToken({
                userId: user._id.toString(),
                role: user.role,
            });

        const refreshToken =
            this.jwtService.generateRefreshToken({
                userId: user._id.toString(),
            });

        const refreshPayload =
            this.jwtService.verifyRefreshToken(
                refreshToken
            );

        await saveRefreshToken(
            refreshPayload.jti,
            user._id.toString(),
            crypto.randomUUID()
        );

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async updateProfile(
        userId: string,
        data: UpdateProfileInput
    ): Promise<User> {
        if (data.phone !== undefined) {
            const existingUser =
                await this.userRepository.findByPhone(
                    data.phone
                );

            if (
                existingUser &&
                existingUser._id.toString() !== userId
            ) {
                throw new AppError(
                    "Phone already exists",
                    409
                );
            }
        }

        const user =
            await this.userRepository.updateProfile(
                userId,
                data
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }


    async getMyProfile(
        userId: string
    ): Promise<User> {
        const user =
            await this.userRepository.findById(
                userId
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

    async addAddress(
        userId: string,
        data: CreateAddressInput
    ): Promise<User> {
        if (data.isDefault) {
            await this.userRepository.clearDefaultAddress(
                userId
            );
        }

        const user =
            await this.userRepository.addAddress(
                userId,
                data
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

    async getAddresses(
        userId: string
    ): Promise<User["addresses"]> {
        const addresses =
            await this.userRepository.getAddresses(
                userId
            );

        if (addresses === null) {
            throw new AppError(
                "User not found",
                404
            );
        }

        return addresses;
    }

    async updateAddress(
        userId: string,
        addressId: string,
        data: UpdateAddressInput
    ): Promise<User> {
        if (data.isDefault === true) {
            await this.userRepository.clearDefaultAddress(userId);
        }

        const user = await this.userRepository.updateAddress(
            userId,
            addressId,
            data
        );

        if (!user) {
            throw new AppError(
                "User or address not found",
                404
            );
        }

        const userObject = user.toObject();

        delete (userObject as Partial<User>).passwordHash;

        return userObject;
    }
    async deleteAddress(
        userId: string,
        addressId: string
    ): Promise<User> {
        const user = await this.userRepository.deleteAddress(
            userId,
            addressId
        );

        if (!user) {
            throw new AppError(
                "User or address not found",
                404
            );
        }

        const userObject = user.toObject();

        delete (userObject as Partial<User>).passwordHash;

        return userObject;
    }

    async setDefaultAddress(
        userId: string,
        addressId: string
    ): Promise<User> {
        const user =
            await this.userRepository.setDefaultAddress(
                userId,
                addressId
            );

        if (!user) {
            throw new AppError(
                "User or address not found",
                404
            );
        }

        const userObject = user.toObject();

        delete (userObject as Partial<User>).passwordHash;

        return userObject;
    }

    async changePassword(
        userId: string,
        data: ChangePasswordInput
    ): Promise<void> {
        const user =
            await this.userRepository.findByIdWithPassword(
                userId
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                data.currentPassword,
                user.passwordHash
            );

        if (!passwordMatches) {
            throw new AppError(
                "Current password is incorrect",
                400
            );
        }

        const passwordHash =
            await bcrypt.hash(
                data.newPassword,
                12
            );

        await this.userRepository.updatePasswordById(
            userId,
            passwordHash
        );
        await deleteRefreshTokensForUser(userId);
    }

    async updateUserStatus(
        userId: string,
        isActive: boolean,
        requesterRole: string
    ): Promise<User> {
        const targetUser =
            await this.userRepository.findById(userId);


        if (!targetUser) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (
            targetUser.role === "SUPER_ADMIN" &&
            !isActive
        ) {
            throw new AppError(
                "SUPER_ADMIN account cannot be deactivated",
                403
            );
        }

        if (
            requesterRole === "ADMIN" &&
            (
                targetUser.role === "ADMIN" ||
                targetUser.role === "SUPER_ADMIN"
            )
        ) {
            throw new AppError(
                "You are not allowed to manage this user",
                403
            );
        }

        const user =
            await this.userRepository.updateUserStatus(
                userId,
                isActive
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (!isActive) {
            await deleteRefreshTokensForUser(
                userId
            );
        }

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

    async deleteMyAccount(
        userId: string
    ): Promise<void> {
        const user =
            await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (user.role === "SUPER_ADMIN") {
            throw new AppError(
                "SUPER_ADMIN account cannot be deleted",
                403
            );
        }

        await this.userRepository.deleteById(
            userId
        );

        await deleteRefreshTokensForUser(
            userId
        );
    }


    async createAdmin(
        data: CreateAdminInput
    ): Promise<User> {
        const existingEmail =
            await this.userRepository.findByEmail(
                data.email
            );

        if (existingEmail) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const existingPhone =
            await this.userRepository.findByPhone(
                data.phone
            );

        if (existingPhone) {
            throw new AppError(
                "Phone number already exists",
                409
            );
        }

        const passwordHash =
            await bcrypt.hash(
                data.password,
                12
            );

        const user =
            await this.userRepository.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                passwordHash,
                role: "ADMIN",
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: false,
            });

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

    async createRider(
        data: CreateRiderInput
    ): Promise<User> {
        const existingEmail =
            await this.userRepository.findByEmail(
                data.email
            );

        if (existingEmail) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const existingPhone =
            await this.userRepository.findByPhone(
                data.phone
            );

        if (existingPhone) {
            throw new AppError(
                "Phone number already exists",
                409
            );
        }

        const passwordHash =
            await bcrypt.hash(
                data.password,
                12
            );

        const user =
            await this.userRepository.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                passwordHash,
                role: "RIDER",
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: false,
            });

        const userObject =
            user.toObject();

        delete (
            userObject as Partial<User>
        ).passwordHash;

        return userObject;
    }

}