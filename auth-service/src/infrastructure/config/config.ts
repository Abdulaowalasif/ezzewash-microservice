const requiredEnvVariables = [
    "MONGODB_URI",
    "REDIS_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "MAIL_HOST",
    "MAIL_PORT",
    "MAIL_USER",
    "MAIL_PASSWORD",
    "MAIL_FROM",
] as const;

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Environment variable ${variable} is not defined`
        );
    }
}

export const env = {
    port: Number(process.env.PORT) || 3001,

    mongodbUri: process.env.MONGODB_URI as string,

    redisUrl: process.env.REDIS_URL as string,

    jwtAccessSecret:
        process.env.JWT_ACCESS_SECRET as string,

    jwtRefreshSecret:
        process.env.JWT_REFRESH_SECRET as string,

    allowedOrigins:
        process.env.ALLOWED_ORIGINS
            ?.split(",")
            .map((origin) => origin.trim())
            .filter(Boolean) ?? [],
};