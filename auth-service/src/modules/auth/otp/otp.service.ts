import crypto from "node:crypto";

import { sendEmail } from "../../../infrastructure/mail/mailer.js";
import { generateOtp } from "./otp.generator.js";
import {
    saveOtp,
    getOtp,
    deleteOtp,
    incrementOtpAttempts,
    deleteOtpAttempts,
} from "./otp.redis.store.js";
import { UserRepository } from "../../users/user.repository.js";
import { AppError } from "../../../infrastructure/http/app-error.js";
import { saveResetToken } from "../password-reset/reset-token.store.js";

export class OtpService {
    private readonly userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    private isOtpValid(
        storedOtp: string,
        providedOtp: string
    ): boolean {
        const storedBuffer =
            Buffer.from(storedOtp);

        const providedBuffer =
            Buffer.from(providedOtp);

        if (
            storedBuffer.length !==
            providedBuffer.length
        ) {
            return false;
        }

        return crypto.timingSafeEqual(
            storedBuffer,
            providedBuffer
        );
    }

    async sendEmailOtp(email: string): Promise<void> {
        const otp = generateOtp();

        // Reset previous failed-attempt counter
        await deleteOtpAttempts(
            email,
            "EMAIL_VERIFICATION"
        );

        await saveOtp(
            email,
            "EMAIL_VERIFICATION",
            otp
        );

        await sendEmail(
            email,
            "Ezzewash Email Verification",
            `Your Ezzewash verification code is: ${otp}\n\nThis code expires in 5 minutes.`
        );
    }

    async verifyEmailOtp(
        email: string,
        otp: string
    ): Promise<void> {
        const storedOtp = await getOtp(
            email,
            "EMAIL_VERIFICATION"
        );

        if (!storedOtp) {
            throw new AppError(
                "OTP is invalid or expired",
                400
            );
        }

        if (!this.isOtpValid(storedOtp, otp)) {
            const attempts =
                await incrementOtpAttempts(
                    email,
                    "EMAIL_VERIFICATION"
                );

            if (attempts >= 5) {
                throw new AppError(
                    "Too many invalid OTP attempts. Please request a new OTP.",
                    429
                );
            }

            throw new AppError(
                "OTP is invalid or expired",
                400
            );
        }

        const user =
            await this.userRepository.markEmailVerified(email);

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        await deleteOtp(
            email,
            "EMAIL_VERIFICATION"
        );

        await deleteOtpAttempts(
            email,
            "EMAIL_VERIFICATION"
        );
    }

    async sendPasswordResetOtp(
        email: string
    ): Promise<void> {
        const otp = generateOtp();

        // Reset previous failed-attempt counter
        await deleteOtpAttempts(
            email,
            "PASSWORD_RESET"
        );

        await saveOtp(
            email,
            "PASSWORD_RESET",
            otp
        );

        await sendEmail(
            email,
            "Ezzewash Password Reset",
            `Your Ezzewash password reset code is: ${otp}\n\nThis code expires in 5 minutes.`
        );
    }

    async verifyPasswordResetOtp(
        email: string,
        otp: string
    ): Promise<string> {
        const storedOtp = await getOtp(
            email,
            "PASSWORD_RESET"
        );

        if (!storedOtp) {
            throw new AppError(
                "OTP is invalid or expired",
                400
            );
        }

        if (!this.isOtpValid(storedOtp, otp)) {
            const attempts =
                await incrementOtpAttempts(
                    email,
                    "PASSWORD_RESET"
                );

            if (attempts >= 5) {
                throw new AppError(
                    "Too many invalid OTP attempts. Please request a new OTP.",
                    429
                );
            }

            throw new AppError(
                "OTP is invalid or expired",
                400
            );
        }

        await deleteOtp(
            email,
            "PASSWORD_RESET"
        );

        await deleteOtpAttempts(
            email,
            "PASSWORD_RESET"
        );

        const resetToken =
            crypto.randomBytes(32).toString("hex");

        await saveResetToken(
            resetToken,
            email
        );

        return resetToken;
    }
}