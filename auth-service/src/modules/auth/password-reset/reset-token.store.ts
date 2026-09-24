import { redisClient } from "../../../infrastructure/redis/redis.js";

interface ResetTokenRecord {
    email: string;
}

const RESET_TOKEN_TTL = 10 * 60;

function getResetTokenKey(
    token: string
): string {
    return `reset_token:${token}`;
}

function getUserResetTokenKey(
    email: string
): string {
    return `reset_token_user:${email}`;
}

export async function saveResetToken(
    token: string,
    email: string
): Promise<void> {
    const tokenKey =
        getResetTokenKey(token);

    const userKey =
        getUserResetTokenKey(email);

    const previousToken =
        await redisClient.get(userKey);

    if (previousToken) {
        await redisClient.del(
            getResetTokenKey(previousToken)
        );
    }

    const record: ResetTokenRecord = {
        email,
    };

    await redisClient.set(
        tokenKey,
        JSON.stringify(record),
        {
            EX: RESET_TOKEN_TTL,
        }
    );

    await redisClient.set(
        userKey,
        token,
        {
            EX: RESET_TOKEN_TTL,
        }
    );
}

export async function getResetToken(
    token: string
): Promise<ResetTokenRecord | null> {
    const data =
        await redisClient.get(
            getResetTokenKey(token)
        );

    if (!data) {
        return null;
    }

    const record =
        JSON.parse(data) as ResetTokenRecord;

    const currentToken =
        await redisClient.get(
            getUserResetTokenKey(
                record.email
            )
        );

    if (currentToken !== token) {
        return null;
    }

    return record;
}

export async function deleteResetToken(
    token: string
): Promise<void> {
    const tokenKey =
        getResetTokenKey(token);

    const data =
        await redisClient.get(tokenKey);

    if (!data) {
        return;
    }

    const record =
        JSON.parse(data) as ResetTokenRecord;

    const userKey =
        getUserResetTokenKey(
            record.email
        );

    const currentToken =
        await redisClient.get(userKey);

    if (currentToken === token) {
        await redisClient.del(userKey);
    }

    await redisClient.del(tokenKey);
}