import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { AppError } from "./app-error.js";

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error("Unhandled error:", error);
    const requestId =
        "requestId" in req
            ? (req as Request & { requestId: string }).requestId
            : undefined;

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message,
            requestId,
        });

        return;
    }

    res.status(500).json({
        message: "Internal server error",
        requestId,
    });
}