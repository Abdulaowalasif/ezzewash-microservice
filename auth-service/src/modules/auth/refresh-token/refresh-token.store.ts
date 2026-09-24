import { redisClient } from "../../../infrastructure/redis/redis.js";

interface RefreshTokenRecord {
    userId: string;
}

export async function saveRefreshToken(
    jti: string,
    userId: string
): Promise<void> {
    const record: RefreshTokenRecord = {
        userId,
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