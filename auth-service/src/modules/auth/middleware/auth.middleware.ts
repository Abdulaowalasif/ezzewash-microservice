import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({
            message: "Authorization header is required",
        });

        return;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        res.status(401).json({
            message: "Invalid authorization format",
        });

        return;
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        res.status(500).json({
            message: "JWT configuration is missing",
        });

        return;
    }

    try {
        const payload = jwt.verify(token, secret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string" ||
            typeof payload.role !== "string"
        ) {
            res.status(401).json({
                message: "Invalid access token",
            });

            return;
        }

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
}