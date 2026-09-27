import express from "express";
import helmet from "helmet";
import cors from 'cors';

import { env } from "./config/config.js";
import orderRoutes from "./routes/order.routes.js";
import { errorMiddleware } from './middlewares/error.middleware.js';
import capacitySlotRoutes from "./routes/capacity-slot.routes.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin:
            env.allowedOrigins.length > 0
                ? env.allowedOrigins
                : true,
    })
);

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "order-service",
    });
});

app.use(
    "/api/v1/orders",
    orderRoutes
);

app.use(
    "/api/v1/capacity-slots",
    capacitySlotRoutes
);





app.use(errorMiddleware);

export default app;