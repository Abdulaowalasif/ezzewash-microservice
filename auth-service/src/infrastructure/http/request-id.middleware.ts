import crypto from "node:crypto";
import type {
    Request,
    Response,
    NextFunction,
} from "express";

export interface RequestWithId extends Request {
    requestId: string;
}

export function requestIdMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const requestId =
        req.header("X-Request-ID") ??
        crypto.randomUUID();

    (req as RequestWithId).requestId = requestId;

    const startTime = Date.now();

    console.log(
        `[${requestId}] ${req.method} ${req.originalUrl}`
    );

    res.setHeader(
        "X-Request-ID",
        requestId
    );

    res.on("finish", () => {
        const duration =
            Date.now() - startTime;

        console.log(
            `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
}