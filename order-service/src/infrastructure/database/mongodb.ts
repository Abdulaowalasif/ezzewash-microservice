import mongoose from "mongoose";

import { env } from "../../config/config.js";

export async function connectToMongoDB(): Promise<void> {
    await mongoose.connect(
        env.mongodbUri
    );
}

export async function disconnectFromMongoDB(): Promise<void> {
    await mongoose.disconnect();
}