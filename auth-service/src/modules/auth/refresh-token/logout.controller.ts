import type { NextFunction, Request, Response } from "express";
import { logoutSchema } from "./logout.schema.js";
import { deleteRefreshToken } from "./refresh-token.store.js";
import { JwtService } from "../../../infrastructure/jwt/jwt.service.js";

const jwtService = new JwtService();

export class LogoutController {
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        const validation = logoutSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.flatten(),
            });

            return;
        }

        try {
            const payload = jwtService.verifyRefreshToken(
                validation.data.refreshToken
            );

            deleteRefreshToken(payload.jti);

            res.status(200).json({
                message: "Logout successful",
            });
        } catch (error) {
            next(error);
        }
    }
}