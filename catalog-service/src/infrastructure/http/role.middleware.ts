import type {
    NextFunction,
    Request,
    Response,
} from "express";

import type {
    UserRole,
} from "./auth.types.js";

import {
    sendError,
} from "./api-response.js";

export function requireRoles(
    ...allowedRoles: UserRole[]
) {
    if (allowedRoles.length === 0) {
        throw new Error(
            "requireRoles() requires at least one role"
        );
    }

    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        if (!req.user) {
            sendError(
                res,
                401,
                "Authentication required"
            );

            return;
        }

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            sendError(
                res,
                403,
                "Forbidden"
            );

            return;
        }

        next();
    };
}