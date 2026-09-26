import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import branchRoutes from "./modules/branches/branch.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";
import itemRoutes from "./modules/items/item.routes.js";
import serviceItemRoutes from "./modules/service-items/service-item.route.js";
import offerRoutes from "./modules/offers/offer.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import branchMembershipRoutes from "./modules/branch-memberships/branch-membership.routes.js";
import {
    redisClient,
} from "./infrastructure/redis/redis.js";

import swaggerUi from "swagger-ui-express";

import {
    swaggerSpec,
} from "./infrastructure/config/swagger.js";

import {
    errorHandler,
} from "./infrastructure/http/error-handler.js";

import {
    requestIdMiddleware,
} from "./infrastructure/http/request-id.middleware.js";

import {
    corsMiddleware,
} from "./infrastructure/http/cors.js";

import {
    sendSuccess,
    sendError,
} from "./infrastructure/http/api-response.js";
import { apiRateLimiter } from "./infrastructure/http/rate-limit.js";

export function createApp() {
    const app = express();
    const startedAt = Date.now();

    app.use(helmet());

    app.use(requestIdMiddleware);

    app.use(corsMiddleware);

    app.use(apiRateLimiter);

    app.use(
        express.json({
            limit: "100kb",
        })
    );

    app.get("/health", (_req, res) => {
        sendSuccess(
            res,
            200,
            {
                status: "ok",
                service: "catalog-service",
                uptimeSeconds: Math.floor(
                    (Date.now() - startedAt) / 1000
                ),
            }
        );
    });

    app.get("/ready", (_req, res) => {
        const mongoReady =
            mongoose.connection.readyState === 1;

        const redisReady =
            redisClient.isReady;

        const ready =
            mongoReady &&
            redisReady;

        sendSuccess(
            res,
            ready ? 200 : 503,
            {
                status: ready
                    ? "ready"
                    : "not_ready",

                service: "catalog-service",

                dependencies: {
                    mongodb: mongoReady
                        ? "up"
                        : "down",

                    redis: redisReady
                        ? "up"
                        : "down",
                },
            }
        );
    });


    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );

    app.use(
        "/api/v1/branches",
        branchRoutes
    );

    app.use(
        "/api/v1/services",
        serviceRoutes
    );

    app.use(
        "/api/v1/items",
        itemRoutes
    );

    app.use(
        "/api/v1/service-items",
        serviceItemRoutes
    );

    app.use(
        "/api/v1/offers",
        offerRoutes
    );

    app.use(
        "/api/v1/reviews",
        reviewRoutes
    );

    app.use(
        "/api/v1/branch-memberships",
        branchMembershipRoutes
    );

    app.use((_req, res) => {
        sendError(
            res,
            404,
            "Route not found"
        );
    });

    app.use(errorHandler);

    return app;
}