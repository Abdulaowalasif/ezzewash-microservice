import type {
    Response,
} from "express";

export function sendSuccess<T>(
    res: Response,
    statusCode: number,
    data?: T,
    message?: string
): void {
    res.status(statusCode).json({
        success: true,

        ...(message
            ? { message }
            : {}),

        ...(data !== undefined
            ? { data }
            : {}),

        requestId:
            res.locals.requestId,
    });
}

export function sendError(
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown
): void {
    res.status(statusCode).json({
        success: false,
        message,

        ...(errors !== undefined
            ? { errors }
            : {}),

        requestId:
            res.locals.requestId,
    });
}
