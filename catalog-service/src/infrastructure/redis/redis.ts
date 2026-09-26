import { createClient } from "redis";

import { env } from "../config/config.js";

export const redisClient =
    createClient({
        url: env.redisUrl,
    });

redisClient.on(
    "error",
    (error) => {
        console.error(
            "Redis client error:",
            error
        );
    }
);

export async function connectRedis(): Promise<void> {
    if (redisClient.isOpen) {
        return;
    }

    await redisClient.connect();
}

export async function disconnectRedis(): Promise<void> {
    if (!redisClient.isOpen) {
        return;
    }

    await redisClient.quit();
}
