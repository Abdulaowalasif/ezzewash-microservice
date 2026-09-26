import cors from "cors";

import { env } from "../config/config.js";

export const corsMiddleware = cors({
    origin: (
        origin,
        callback
    ) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (
            env.allowedOrigins.length === 0 ||
            env.allowedOrigins.includes(origin)
        ) {
            callback(null, true);
            return;
        }

        callback(
            new Error("CORS origin not allowed")
        );
    },

    credentials: true,
});