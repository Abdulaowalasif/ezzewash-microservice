import type {
    NextFunction,
    Request,
    Response,
} from "express";

import crypto from "node:crypto";

export function requestIdMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const incomingRequestId =
        req.header("X-Request-Id");

    const requestId =
        incomingRequestId?.trim() ||
        crypto.randomUUID();

    res.setHeader(
        "X-Request-Id",
        requestId
    );

    res.locals.requestId = requestId;

    next();
}