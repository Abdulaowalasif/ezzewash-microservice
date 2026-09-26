import type {
    NextFunction,
    Request,
    Response,
} from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/config.js";

import type {
    AuthenticatedUser,
    UserRole,
} from "./auth.types.js";

import {
    sendError,
} from "./api-response.js";

interface JwtPayload {
    sub?: string;
    userId?: string;
    role?: unknown;
}

const VALID_ROLES: readonly UserRole[] = [
    "USER",
    "RIDER",
    "ADMIN",
    "SUPER_ADMIN",
];

function isValidUserRole(
    role: unknown
): role is UserRole {
    return (
        typeof role === "string" &&
        VALID_ROLES.includes(
            role as UserRole
        )
    );
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const authorization =
            req.headers.authorization;

        if (!authorization) {
            sendError(
                res,
                401,
                "Authentication required"
            );

            return;
        }

        const parts =
            authorization.trim().split(/\s+/);

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {
            sendError(
                res,
                401,
                "Invalid authorization header"
            );

            return;
        }

        const token = parts[1];

        const decoded =
            jwt.verify(
                token,
                env.jwtAccessSecret
            ) as JwtPayload;

        const userId =
            decoded.sub ?? decoded.userId;

        if (
            typeof userId !== "string" ||
            userId.trim().length === 0
        ) {
            sendError(
                res,
                401,
                "Invalid access token"
            );

            return;
        }

        if (!isValidUserRole(decoded.role)) {
            sendError(
                res,
                401,
                "Invalid access token role"
            );

            return;
        }

        const user: AuthenticatedUser = {
            userId,
            role: decoded.role,
        };

        req.user = user;

        next();
    } catch {
        sendError(
            res,
            401,
            "Invalid or expired access token"
        );
    }
}
