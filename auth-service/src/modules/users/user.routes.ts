import { Router } from "express";

import { UserController } from "./user.controller.js";

import { authenticate, type AuthenticatedRequest } from "../auth/middleware/auth.middleware.js";

import { requireRole } from "../auth/middleware/role.middleware.js";

import { RefreshTokenController } from "../auth/refresh-token/refresh-token.controller.js";

import { LogoutController } from "../auth/refresh-token/logout.controller.js";

import {
    loginRateLimiter,
    otpRateLimiter,
    otpVerificationRateLimiter
} from "../../infrastructure/http/rate-limiters.js";

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
    requireRole("ADMIN"),
    (req: AuthenticatedRequest, res) => {
        res.status(200).json({
            message: "You are an admin",
            user: req.user,
        });
    }
);

router.get(
    "/:id",
    authenticate,
    (req, res) => {
        userController.getUserById(req, res);
    }
);

router.post(
    "/refresh",
    (req, res) => {
        refreshTokenController.refresh(req, res);
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

export default router;