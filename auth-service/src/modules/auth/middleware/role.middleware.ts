import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export function requireRole(...allowedRoles: string[]) {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void => {
        if (!req.user) {
            res.status(401).json({
                message: "Authentication required",
            });

            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: "Forbidden",
            });

            return;
        }

        next();
    };
}