import type { NextFunction, Request, Response } from "express";
import { refreshTokenSchema } from "./refresh-token.schema.js";
import { RefreshTokenService } from "./refresh-token.service.js";
import { JwtService } from "../../../infrastructure/jwt/jwt.service.js";
import { UserRepository } from "../../users/user.repository.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getAuthenticatedUserId } from "../middleware/required-authenticated-user.js";
import { sessionIdSchema } from "./session.schema.js";

const refreshTokenService = new RefreshTokenService(
    new JwtService(),
    new UserRepository()
);

export class RefreshTokenController {
    async refresh(req: Request, res: Response): Promise<void> {
        const validation = refreshTokenSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.flatten(),
            });

            return;
        }

        try {
            const tokens =
                await refreshTokenService.refresh(
                    validation.data.refreshToken
                );

            res.status(200).json({
                message: "Access token refreshed successfully",
                tokens,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Invalid refresh token";

            res.status(401).json({
                message,
            });
        }
    }

    async getSessions(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const sessions =
                await refreshTokenService.getSessions(
                    userId
                );

            res.status(200).json({
                sessions,
            });
        } catch (error) {
            next(error);
        }
    }

    async revokeSession(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            const sessionId = Array.isArray(req.params.sessionId)
                ? req.params.sessionId[0]
                : req.params.sessionId;

            if (!sessionId) {
                res.status(400).json({
                    message: "Session ID is required",
                });
                return;
            }

            const validation =
                sessionIdSchema.safeParse(sessionId);

            if (!validation.success) {
                res.status(400).json({
                    message: "Invalid session ID",
                });
                return;
            }

            await refreshTokenService.revokeSession(
                userId,
                validation.data
            );

            res.status(200).json({
                message: "Session revoked successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    async revokeAllSessions(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = getAuthenticatedUserId(req);

            await refreshTokenService.revokeAllSessions(
                userId
            );

            res.status(200).json({
                message: "All sessions revoked successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}