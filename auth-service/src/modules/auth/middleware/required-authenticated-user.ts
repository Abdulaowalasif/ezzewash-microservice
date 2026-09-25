import { AppError } from "../../../infrastructure/http/app-error.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export function getAuthenticatedUserId(
    req: AuthenticatedRequest
): string {
    if (!req.user) {
        throw new AppError(
            "Authentication required",
            401
        );
    }

    return req.user.userId;
}