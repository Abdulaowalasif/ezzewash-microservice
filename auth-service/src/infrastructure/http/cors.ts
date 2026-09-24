import cors from "cors";

import { env } from "../config/config.js";

export const corsMiddleware = cors({
    origin: env.allowedOrigins.length > 0
        ? env.allowedOrigins
        : false,
    credentials: true,
});