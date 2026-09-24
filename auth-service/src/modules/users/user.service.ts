import bcrypt from "bcrypt";

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
            refreshPayload.userId
        );

        return {
            user,
            accessToken,
            refreshToken,
        };
    }
}