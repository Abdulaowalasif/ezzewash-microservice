import { redisClient } from "../../../infrastructure/redis/redis.js";

interface RefreshTokenRecord {
    userId: string;
    sessionId: string;
    createdAt: string;
}


interface RevokedRefreshTokenRecord {
    userId: string;
    sessionId: string;
    revokedAt: string;
}

export async function saveRefreshToken(
    jti: string,
    userId: string,
    sessionId: string,
    createdAt?: string
): Promise<void> {
    const record: RefreshTokenRecord = {
        userId,
        sessionId,
        createdAt: createdAt ?? new Date().toISOString(),
    };

    await redisClient.set(
        `refresh_token:${jti}`,
        JSON.stringify(record),
        {
            EX: 7 * 24 * 60 * 60,
        }
    );
}

export async function getRefreshToken(
    jti: string
): Promise<RefreshTokenRecord | null> {
    const data =
        await redisClient.get(
            `refresh_token:${jti}`
        );

    if (!data) {
        return null;
    }

    return JSON.parse(
        data
    ) as RefreshTokenRecord;
}

export async function deleteRefreshToken(
    jti: string
): Promise<void> {
    await redisClient.del(
        `refresh_token:${jti}`
    );
}

export async function deleteRefreshTokensForUser(
    userId: string
): Promise<void> {
    const pattern =
        "refresh_token:*";

    for await (
        const keys of redisClient.scanIterator({
            MATCH: pattern,
            COUNT: 100,
        })
    ) {
        if (keys.length === 0) {
            continue;
        }

        const values =
            await redisClient.mGet(keys);

        const keysToDelete: string[] = [];

        for (
            let i = 0;
            i < keys.length;
            i++
        ) {
            const value = values[i];

            if (!value) {
                continue;
            }

            try {
                const record =
                    JSON.parse(
                        value
                    ) as RefreshTokenRecord;

                if (
                    record.userId === userId
                ) {
                    const key = keys[i];

                    if (!key) {
                        continue;
                    }

                    keysToDelete.push(key);
                }
            } catch {
                // Ignore malformed Redis records
            }
        }

        if (keysToDelete.length > 0) {
            await redisClient.del(
                keysToDelete
            );
        }
    }
}


export async function getRefreshTokensForUser(
    userId: string
): Promise<
    Array<{
        jti: string;
        sessionId: string;
        createdAt: string;
    }>
> {
    const sessions: Array<{
        jti: string;
        sessionId: string;
        createdAt: string;
    }> = [];

    for await (
        const keys of redisClient.scanIterator({
            MATCH: "refresh_token:*",
            COUNT: 100,
        })
    ) {
        if (keys.length === 0) {
            continue;
        }

        const values = await redisClient.mGet(keys);

        for (let i = 0; i < keys.length; i++) {
            const value = values[i];
            const key = keys[i];

            if (!value || !key) {
                continue;
            }

            try {
                const record =
                    JSON.parse(value) as RefreshTokenRecord;

                if (
                    record.userId === userId &&
                    record.sessionId
                ) {
                    sessions.push({
                        jti: key.replace(
                            "refresh_token:",
                            ""
                        ),
                        sessionId: record.sessionId,
                        createdAt: record.createdAt,
                    });
                }
            } catch {
                // Ignore malformed Redis records
            }
        }
    }

    return sessions;
}

export async function deleteSessionForUser(
    userId: string,
    sessionId: string
): Promise<boolean> {
    let deleted = false;

    for await (
        const keys of redisClient.scanIterator({
            MATCH: "refresh_token:*",
            COUNT: 100,
        })
    ) {
        if (keys.length === 0) {
            continue;
        }

        const values = await redisClient.mGet(keys);
        const keysToDelete: string[] = [];

        for (let i = 0; i < keys.length; i++) {
            const value = values[i];
            const key = keys[i];

            if (!value || !key) {
                continue;
            }

            try {
                const record =
                    JSON.parse(value) as RefreshTokenRecord;

                if (
                    record.userId === userId &&
                    record.sessionId === sessionId
                ) {
                    keysToDelete.push(key);
                }
            } catch {
                // Ignore malformed Redis records
            }
        }

        if (keysToDelete.length > 0) {
            await redisClient.del(keysToDelete);
            deleted = true;
        }
    }

    return deleted;
}

export async function revokeRefreshToken(
    jti: string,
    userId: string,
    sessionId: string
): Promise<void> {
    const record: RevokedRefreshTokenRecord = {
        userId,
        sessionId,
        revokedAt: new Date().toISOString(),
    };

    await redisClient.set(
        `revoked_refresh_token:${jti}`,
        JSON.stringify(record),
        {
            EX: 7 * 24 * 60 * 60,
        }
    );
}

export async function getRevokedRefreshToken(
    jti: string
): Promise<RevokedRefreshTokenRecord | null> {
    const data = await redisClient.get(
        `revoked_refresh_token:${jti}`
    );

    if (!data) {
        return null;
    }

    return JSON.parse(
        data
    ) as RevokedRefreshTokenRecord;
}