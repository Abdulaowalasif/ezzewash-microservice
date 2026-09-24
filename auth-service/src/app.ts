import express from "express";
import userRoutes from "./modules/users/user.routes.js";
import { errorHandler } from "./infrastructure/http/error-handler.js";
import { requestIdMiddleware } from "./infrastructure/http/request-id.middleware.js";
import helmet from "helmet";
import mongoose from "mongoose";
import { corsMiddleware } from './infrastructure/http/cors.js';
import { redisClient } from "./infrastructure/redis/redis.js";

export function createApp() {
    const app = express();
    const startedAt = Date.now();

    app.use(helmet());
    app.use(corsMiddleware);
    app.use(requestIdMiddleware);
    app.use(express.json({
        limit: "100kb"
    }));

    app.get("/health", (req, res) => {
        res.json({
            status: "ok",
            service: "auth-service",
            uptimeSeconds: Math.floor(
                (Date.now() - startedAt) / 1000
            ),
        });
    });
    app.get("/ready", (_req, res) => {
        const mongoReady =
            mongoose.connection.readyState === 1;

        const redisReady =
            redisClient.isReady;

        const ready =
            mongoReady && redisReady;

        res.status(ready ? 200 : 503).json({
            status: ready ? "ready" : "not_ready",
            service: "auth-service",
            dependencies: {
                mongodb: mongoReady
                    ? "up"
                    : "down",
                redis: redisReady
                    ? "up"
                    : "down",
            },
        });
    });
    app.use("/api/v1/users", userRoutes);

    app.use((req, res) => {
        res.status(404).json({
            message: "Route not found",
        });
    });

    app.use(errorHandler);

    return app;
}