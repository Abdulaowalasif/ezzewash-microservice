import { createApp } from "./app.js";

import {
    connectToMongoDB,
} from "./infrastructure/database/mongodb.js";
import {
    connectRedis,
    disconnectRedis,
    redisClient,
} from "./infrastructure/redis/redis.js";

import mongoose from "mongoose";

import { env } from "./infrastructure/config/config.js";

const app = createApp();

const PORT = env.port;

let server:
    ReturnType<typeof app.listen> | undefined;

let shuttingDown = false;

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "Uncaught exception:",
            error
        );

        process.exit(1);
    }
);

process.on(
    "unhandledRejection",
    (reason) => {
        console.error(
            "Unhandled promise rejection:",
            reason
        );

        process.exit(1);
    }
);

async function shutdown(
    signal: string
): Promise<void> {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log(
        `${signal} received. Shutting down...`
    );

    try {
        if (server) {
            await new Promise<void>(
                (resolve, reject) => {
                    server!.close(
                        (error) => {
                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve();
                        }
                    );
                }
            );
        }

        await mongoose.connection.close();
        await disconnectRedis();

        console.log(
            "Catalog service shut down successfully"
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "Error during shutdown:",
            error
        );

        process.exit(1);
    }
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

async function startServer(): Promise<void> {
    try {
        await connectToMongoDB();
        await connectRedis();

        server = app.listen(
            PORT,
            () => {
                console.log(
                    `Catalog service running on port ${PORT}`
                );
            }
        );
    } catch (error) {
        console.error(
            "Failed to start catalog service:",
            error
        );

        process.exit(1);
    }
}

void startServer();