import { Router } from "express";

import { UserController } from "./user.controller.js";

import { authenticate, type AuthenticatedRequest } from "../auth/middleware/auth.middleware.js";

import { requireRole } from "../auth/middleware/role.middleware.js";

import { RefreshTokenController } from "../auth/refresh-token/refresh-token.controller.js";

import { LogoutController } from "../auth/refresh-token/logout.controller.js";

import {
    loginRateLimiter,
    otpRateLimiter,
    otpVerificationRateLimiter,
    refreshRateLimiter
} from "../../infrastructure/http/rate-limiters.js";
import { profilePictureUpload } from "../../infrastructure/upload/multer.js";

const router = Router();

const userController = new UserController();

const refreshTokenController =
    new RefreshTokenController();

const logoutController =
    new LogoutController();

router.post(
    "/logout",
    authenticate,
    (req, res, next) => {
        logoutController.logout(req, res, next);
    }
);

router.get(
    "/admin-test",
    authenticate,
    requireRole("ADMIN", "SUPER_ADMIN"),
    (req: AuthenticatedRequest, res) => {
        res.status(200).json({
            message: "You are an admin",
            user: req.user,
        });
    }
);

router.patch(
    "/me",
    authenticate,
    (req, res, next) => {
        userController.updateProfile(
            req,
            res,
            next
        );
    }
);


router.get(
    "/me",
    authenticate,
    (req, res, next) => {
        userController.getMyProfile(
            req,
            res,
            next
        );
    }
);

router.post(
    "/me/addresses",
    authenticate,
    (req, res, next) => {
        userController.addAddress(
            req,
            res,
            next
        );
    }
);

router.get(
    "/me/addresses",
    authenticate,
    (req, res, next) => {
        userController.getAddresses(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/me/addresses/:addressId",
    authenticate,
    (req, res, next) => {
        userController.updateAddress(
            req,
            res,
            next
        );
    }
);
router.delete(
    "/me/addresses/:addressId",
    authenticate,
    (req, res, next) => {
        userController.deleteAddress(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/me/addresses/:addressId/default",
    authenticate,
    (req, res, next) => {
        userController.setDefaultAddress(
            req,
            res,
            next
        );
    }
);
router.post(
    "/refresh",
    refreshRateLimiter,
    (req, res) => {
        refreshTokenController.refresh(
            req,
            res
        );
    }
);

router.post(
    "/register",
    otpRateLimiter,
    (req, res, next) => {
        userController.register(req, res, next);
    }
);

router.post(
    "/verify-email",
    otpVerificationRateLimiter,
    (req, res, next) => {
        userController.verifyEmail(req, res, next);
    }
);

router.post(
    "/resend-verification",
    otpRateLimiter,
    (req, res, next) => {
        userController.resendVerificationOtp(req, res, next);
    }
);


router.patch(
    "/me/password",
    authenticate,
    (req, res, next) => {
        userController.changePassword(
            req,
            res,
            next
        );
    }
);

router.post(
    "/me/profile-picture",
    authenticate,
    profilePictureUpload.single("profilePicture"),
    (req, res, next) => {
        userController.uploadProfilePicture(req, res, next);
    }
);
router.get(
    "/:id",
    authenticate,
    (req: AuthenticatedRequest, res, next) => {
        if (
            req.user!.userId !== req.params.id &&
            req.user!.role !== "ADMIN" &&
            req.user!.role !== "SUPER_ADMIN"
        ) {
            res.status(403).json({
                message: "Forbidden",
            });
            return;
        }
        userController.getInternalUserById(req, res, next);
    }
);
router.patch(
    "/:id/status",
    authenticate,
    requireRole("ADMIN", "SUPER_ADMIN"),
    (req, res, next) => {
        userController.updateUserStatus(
            req,
            res,
            next
        );
    }
);

router.delete(
    "/me",
    authenticate,
    (req, res, next) => {
        userController.deleteMyAccount(
            req,
            res,
            next
        );
    }
);


router.get(
    "/sessions",
    authenticate,
    (req, res, next) => {
        refreshTokenController.getSessions(
            req,
            res,
            next
        );
    }
);

router.delete(
    "/sessions/:sessionId",
    authenticate,
    (req, res, next) => {
        refreshTokenController.revokeSession(
            req,
            res,
            next
        );
    }
);

router.delete(
    "/sessions",
    authenticate,
    (req, res, next) => {
        refreshTokenController.revokeAllSessions(
            req,
            res,
            next
        );
    }
);


router.post(
    "/forgot-password",
    otpRateLimiter,
    (req, res, next) => {
        userController.forgotPassword(req, res, next);
    }
);

router.post(
    "/verify-reset-otp",
    otpVerificationRateLimiter,
    (req, res, next) => {
        userController.verifyResetOtp(req, res, next);
    }
);

router.post(
    "/reset-password",
    otpRateLimiter,
    (req, res, next) => {
        userController.resetPassword(req, res, next);
    }
);

router.post(
    "/login",
    loginRateLimiter,
    (req, res, next) => {
        userController.login(req, res, next);
    }
);

router.post(
    "/admin/admins",
    authenticate,
    requireRole("SUPER_ADMIN"),
    (req, res, next) => {
        userController.createAdmin(
            req,
            res,
            next
        );
    }
);


router.post(
    "/admin/riders",
    authenticate,
    requireRole("ADMIN", "SUPER_ADMIN"),
    (req, res, next) => {
        userController.createRider(
            req,
            res,
            next
        );
    }
);

export default router;