import type { NextFunction, Request, Response } from "express";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import type { RegisterUserDto } from "./dto/register-user.dto.js";
import { registerUserSchema } from "./validation/register-user.schema.js";
import { OtpService } from "../auth/otp/otp.service.js";
import { verifyEmailSchema } from "../auth/otp/verify-email.schema.js";
import { forgotPasswordSchema } from "../auth/password-reset/forgot-password.schema.js";
import { verifyResetOtpSchema } from "../auth/password-reset/verify-reset-otp.schema.js";
import { resetPasswordSchema } from "../auth/password-reset/reset-password.schema.js";
import { loginUserSchema } from "./validation/login-user.schema.js";
import { JwtService } from "../../infrastructure/jwt/jwt.service.js";

const userRepository = new UserRepository();
const otpService = new OtpService();

const jwtService = new JwtService();

const userService = new UserService(
    userRepository,
    otpService,
    jwtService
);
export class UserController {
    async getUserById(req: Request, res: Response): Promise<void> {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!id) {
            res.status(400).json({
                message: "User ID is required",
            });

            return;
        }

        const user = await userService.getUserById(id);

        if (!user) {
            res.status(404).json({
                message: "User not found",
            });

            return;
        }

        res.status(200).json({
            user,
        });
    }

    async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = registerUserSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        try {
            const user = await userService.register(result.data);

            res.status(201).json({
                message: "User registered successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }


    async verifyEmail(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = verifyEmailSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        try {
            const otpService = new OtpService();

            await otpService.verifyEmailOtp(
                result.data.email,
                result.data.otp
            );

            res.status(200).json({
                message: "Email verified successfully",
            });
        } catch (error) {
            next(error);
        }
    }


    async resendVerificationOtp(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const email = req.body?.email;

        if (typeof email !== "string" || !email.trim()) {
            res.status(400).json({
                message: "Email is required",
            });

            return;
        }

        try {
            await userService.resendVerificationOtp(email.trim().toLowerCase());

            res.status(200).json({
                message: "Verification OTP sent successfully",
            });
        } catch (error) {
            next(error);
        }
    }


    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        const result = forgotPasswordSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        try {
            await userService.requestPasswordReset(result.data.email);

            res.status(200).json({
                message:
                    "If an account exists for this email, a password reset code has been sent.",
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        const result = verifyResetOtpSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        try {
            const otpService = new OtpService();

            const resetToken = await otpService.verifyPasswordResetOtp(
                result.data.email,
                result.data.otp
            );

            res.status(200).json({
                message: "OTP verified successfully",
                resetToken,
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        const result = resetPasswordSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        try {
            await userService.resetPassword(
                result.data.resetToken,
                result.data.newPassword
            );

            res.status(200).json({
                message: "Password reset successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const validation = loginUserSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.flatten(),
            });

            return;
        }

        try {
            const loginResult = await userService.login(validation.data);

            res.status(200).json({
                message: "Login successful",
                ...loginResult,
            });
        } catch (error) {
            next(error);
        }
    }

}