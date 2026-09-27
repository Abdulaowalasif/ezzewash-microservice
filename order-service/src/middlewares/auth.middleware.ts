import type {
    NextFunction,
    Request,
    Response,
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/config.js";

export interface AccessTokenPayload {
    userId: string;
    role: string;
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const header =
            req.headers.authorization;

        if (
            !header ||
            !header.startsWith("Bearer ")
        ) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const token =
            header.substring(7);

        const payload =
            jwt.verify(
                token,
                env.jwtAccessSecret
            ) as AccessTokenPayload;

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}


export function requireRoles(
    ...allowedRoles: string[]
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        if (
            !req.user ||
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            res.status(403).json({
                success: false,
                message: "Forbidden",
            });
            return;
        }

        next();
    };
}