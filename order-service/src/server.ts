import "dotenv/config";

import app from "./app.js";

import {
    connectToMongoDB,
    disconnectFromMongoDB,
} from "./infrastructure/database/mongodb.js";

import { env } from "./config/config.js";

let server:
    | ReturnType<typeof app.listen>
    | undefined;

async function startServer(): Promise<void> {
    await connectToMongoDB();

    server = app.listen(
        env.port,
        () => {
            console.log(
                `Order service running on port ${env.port}`
            );
        }
    );
}

async function shutdown(): Promise<void> {
    if (server) {
        server.close();
    }

    await disconnectFromMongoDB();

    process.exit(0);
}

process.on(
    "SIGINT",
    () => {
        void shutdown();
    }
);

process.on(
    "SIGTERM",
    () => {
        void shutdown();
    }
);

void startServer();