import mongoose from "mongoose";

import { env } from "../config/config.js";

export async function connectToMongoDB(): Promise<void> {
    mongoose.connection.on(
        "disconnected",
        () => {
            console.warn("MongoDB disconnected");
        }
    );

    mongoose.connection.on(
        "reconnected",
        () => {
            console.log("MongoDB reconnected");
        }
    );

    mongoose.connection.on(
        "error",
        (error) => {
            console.error(
                "MongoDB connection error:",
                error
            );
        }
    );

    await mongoose.connect(env.mongodbUri);

    console.log("MongoDB connected");
}