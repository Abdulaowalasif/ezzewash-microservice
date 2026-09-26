import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum([
            "development",
            "production",
            "test",
        ])
        .default("development"),

    PORT: z.coerce
        .number()
        .default(3002),

    MONGO_URI: z
        .string()
        .min(1),

    JWT_ACCESS_SECRET: z
        .string()
        .min(1),

    ALLOWED_ORIGINS: z
        .string()
        .default(""),

    REDIS_URL: z
        .string()
        .min(1),
});

const parsedEnv =
    envSchema.parse(process.env);

export const env = {
    nodeEnv: parsedEnv.NODE_ENV,

    port: parsedEnv.PORT,

    mongodbUri:
        parsedEnv.MONGO_URI,

    jwtAccessSecret:
        parsedEnv.JWT_ACCESS_SECRET,

    allowedOrigins:
        parsedEnv.ALLOWED_ORIGINS
            .split(",")
            .map((origin) =>
                origin.trim()
            )
            .filter(Boolean),

    redisUrl:
        parsedEnv.REDIS_URL,
};
