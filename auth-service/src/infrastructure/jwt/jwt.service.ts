import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from '../config/config.js';
export interface AccessTokenPayload {
    userId: string;
    role: string;
}

export interface RefreshTokenPayload {
    userId: string;
    jti: string;
}
export class JwtService {
    generateAccessToken(payload: AccessTokenPayload): string {
        const secret = env.jwtAccessSecret;

        return jwt.sign(payload, secret, {
            expiresIn: "7d",
        });
    }

    generateRefreshToken(payload: {
        userId: string;
    }): string {
        const secret = env.jwtRefreshSecret;

        return jwt.sign(
            {
                userId: payload.userId,
                jti: crypto.randomUUID(),
            },
            secret,
            {
                expiresIn: "7d",
            }
        );
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        const secret = env.jwtRefreshSecret;

        const payload = jwt.verify(token, secret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string" ||
            typeof payload.jti !== "string"
        ) {
            throw new Error("Invalid refresh token");
        }

        return {
            userId: payload.userId,
            jti: payload.jti,
        };
    }
}