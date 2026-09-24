import type { Request, Response } from "express";
import { refreshTokenSchema } from "./refresh-token.schema.js";
import { RefreshTokenService } from "./refresh-token.service.js";
import { JwtService } from "../../../infrastructure/jwt/jwt.service.js";
import { UserRepository } from "../../users/user.repository.js";

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
}