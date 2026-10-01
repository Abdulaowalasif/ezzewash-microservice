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
import type { AuthenticatedRequest } from "../auth/middleware/auth.middleware.js";
import { updateProfileSchema } from "./validation/update-user.schema.js";
import { createAddressSchema } from "./validation/create-address.schema.js";
import { updateAddressSchema } from "./validation/update-address.schema.js";
import { isValidObjectId } from "../../infrastructure/validation/object-id.js";
import { getAuthenticatedUserId } from "../auth/middleware/required-authenticated-user.js";
import { changePasswordSchema } from "./validation/change-password.schema.js";
import { validateImageFile } from "../../infrastructure/upload/validate-image.js";
import { updateUserStatusSchema } from "./validation/update-user-status.schema.js";
import { createAdminSchema } from "./validation/create-admin.schema.js";
import { createRiderSchema } from "./validation/create-rider.schema.js";


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

    async updateProfile(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const data = updateProfileSchema.parse(req.body);

            const user =
                await userService.updateProfile(
                    userId,
                    data
                );

            res.status(200).json({
                message: "Profile updated successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyProfile(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const user =
                await userService.getMyProfile(userId);

            res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }

    async addAddress(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const data =
                createAddressSchema.parse(req.body);

            const user =
                await userService.addAddress(
                    userId,
                    data
                );

            res.status(201).json({
                message: "Address added successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAddresses(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const addresses =
                await userService.getAddresses(userId);

            res.status(200).json({
                addresses,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateAddress(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const addressId = Array.isArray(req.params.addressId)
                ? req.params.addressId[0]
                : req.params.addressId;

            if (!addressId) {
                res.status(400).json({
                    message: "Address ID is required",
                });
                return;
            }

            if (!isValidObjectId(addressId)) {
                res.status(400).json({
                    message: "Invalid address ID",
                });
                return;
            }

            const data =
                updateAddressSchema.parse(req.body);

            const user =
                await userService.updateAddress(
                    userId,
                    addressId,
                    data
                );

            res.status(200).json({
                message: "Address updated successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }


    async deleteAddress(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const addressId = Array.isArray(req.params.addressId)
                ? req.params.addressId[0]
                : req.params.addressId;

            if (!addressId) {
                res.status(400).json({
                    message: "Address ID is required",
                });
                return;
            }

            if (!isValidObjectId(addressId)) {
                res.status(400).json({
                    message: "Invalid address ID",
                });
                return;
            }

            const user =
                await userService.deleteAddress(
                    userId,
                    addressId
                );

            res.status(200).json({
                message: "Address deleted successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async setDefaultAddress(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const addressId = Array.isArray(req.params.addressId)
                ? req.params.addressId[0]
                : req.params.addressId;

            if (!addressId) {
                res.status(400).json({
                    message: "Address ID is required",
                });
                return;
            }

            if (!isValidObjectId(addressId)) {
                res.status(400).json({
                    message: "Invalid address ID",
                });
                return;
            }

            const user =
                await userService.setDefaultAddress(
                    userId,
                    addressId
                );

            res.status(200).json({
                message: "Default address updated successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const data = changePasswordSchema.parse(req.body);

            await userService.changePassword(
                userId,
                data
            );

            res.status(200).json({
                message: "Password changed successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadProfilePicture(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            if (!req.file) {
                res.status(400).json({
                    message: "Profile picture is required",
                });
                return;
            }

            const isValidImage = await validateImageFile(
                req.file.path
            );

            if (!isValidImage) {
                res.status(400).json({
                    message: "Invalid image file",
                });
                return;
            }

            const profilePictureUrl =
                `http://localhost:3001/uploads/profile-pictures/${req.file.filename}`;

            const user = await userService.updateProfile(
                userId,
                {
                    profilePicture: profilePictureUrl,
                }
            );

            res.status(200).json({
                message: "Profile picture uploaded successfully",
                profilePicture: user.profilePicture,
            });
        } catch (error) {
            next(error);
        }
    }
    async updateUserStatus(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const targetUserId = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

            if (!targetUserId) {
                res.status(400).json({
                    message: "User ID is required",
                });
                return;
            }

            const data = updateUserStatusSchema.parse(
                req.body
            );

            const user = await userService.updateUserStatus(
                targetUserId,
                data.isActive,
                req.user!.role
            );

            res.status(200).json({
                message: data.isActive
                    ? "User activated successfully"
                    : "User deactivated successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }


    async deleteMyAccount(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            await userService.deleteMyAccount(userId);

            res.status(200).json({
                message: "Account deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
    async createAdmin(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createAdminSchema.parse(req.body);

            const user =
                await userService.createAdmin(data);

            res.status(201).json({
                message: "Admin created successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async createRider(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createRiderSchema.parse(req.body);

            const user =
                await userService.createRider(data);

            res.status(201).json({
                message: "Rider created successfully",
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getInternalUserById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

            if (!id) {
                res.status(400).json({
                    message: "User ID is required",
                });
                return;
            }

            const user =
                await userService.getUserById(id);

            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }

            res.status(200).json({
                id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isActive: user.isActive,
                role: user.role,
            });
        } catch (error) {
            next(error);
        }
    }
}