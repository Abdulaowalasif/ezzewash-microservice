import mongoose from "mongoose";

import { env } from "../config/config.js";

export async function connectToMongoDB(): Promise<void> {
    try {
        await mongoose.connect(
            env.mongodbUri
        );

        console.log(
            "MongoDB connected"
        );
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error
        );

        throw error;
    }
}