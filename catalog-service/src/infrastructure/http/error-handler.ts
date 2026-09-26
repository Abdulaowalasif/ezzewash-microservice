import type {
    ErrorRequestHandler,
} from "express";

import { ZodError } from "zod";

import { AppError } from "./app-error.js";
import { sendError } from "./api-response.js";

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
) => {
    if (error instanceof ZodError) {
        sendError(
            res,
            400,
            "Validation failed",
            error.issues.map(
                (issue) => ({
                    field:
                        issue.path.join("."),
                    message:
                        issue.message,
                })
            )
        );

        return;
    }

    if (error instanceof AppError) {
        sendError(
            res,
            error.statusCode,
            error.message
        );

        return;
    }

    console.error(
        "Unhandled application error:",
        error
    );

    sendError(
        res,
        500,
        "Internal server error"
    );
};
