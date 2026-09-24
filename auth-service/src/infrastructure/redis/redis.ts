import { createClient } from "redis";

import { env } from "../config/config.js";

export const redisClient = createClient({
    url: env.redisUrl,
});

redisClient.on("error", (error) => {
    console.error("Redis client error:", error);
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis ready");
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
    console.log("Redis connection closed");
});

export async function connectToRedis(): Promise<void> {
    if (redisClient.isOpen) {
        return;
    }

    await redisClient.connect();

    console.log("Redis connected");
}