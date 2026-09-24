import "dotenv/config";
import "./infrastructure/config/config.js";
import { createApp } from "./app.js";
import { connectToMongoDB } from "./infrastructure/database/mongodb.js";
import mongoose from "mongoose";
import {
    connectToRedis,
    redisClient,
} from "./infrastructure/redis/redis.js";
import { env } from "./infrastructure/config/config.js";

const app = createApp();

const PORT = env.port || 8000;

async function startServer(): Promise<void> {
    try {

        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception:", error);
            process.exit(1);
        });

        process.on("unhandledRejection", (reason) => {
            console.error("Unhandled promise rejection:", reason);
            process.exit(1);
        });

        await connectToMongoDB();
        await connectToRedis();

        const server = app.listen(PORT, () => {
            console.log(`Auth service running on port ${PORT}`);
        });

        const shutdown = async (signal: string): Promise<void> => {
            console.log(`${signal} received. Shutting down...`);

            server.close(async () => {
                try {
                    await mongoose.connection.close();

                    if (redisClient.isOpen) {
                        await redisClient.quit();
                    }

                    console.log("Auth service shut down successfully");
                    process.exit(0);
                } catch (error) {
                    console.error(
                        "Error during shutdown",
                        error
                    );

                    process.exit(1);
                }
            });
        };

        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });

        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });
    } catch (error) {
        console.error(
            "Failed to start auth service",
            error
        );

        process.exit(1);
    }
}

void startServer();