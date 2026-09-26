import {
    redisClient,
} from "./redis.js";

export class RedisCache {
    async get<T>(
        key: string
    ): Promise<T | null> {
        const value =
            await redisClient.get(key);

        if (value === null) {
            return null;
        }

        return JSON.parse(value) as T;
    }

    async set<T>(
        key: string,
        value: T,
        ttlSeconds: number
    ): Promise<void> {
        await redisClient.set(
            key,
            JSON.stringify(value),
            {
                EX: ttlSeconds,
            }
        );
    }

    async delete(
        key: string
    ): Promise<void> {
        await redisClient.del(key);
    }

    async deleteByPrefix(
        prefix: string
    ): Promise<void> {
        let cursor = "0";

        do {
            const result =
                await redisClient.scan(
                    cursor,
                    {
                        MATCH: `${prefix}*`,
                        COUNT: 100,
                    }
                );

            cursor = result.cursor;

            if (
                result.keys.length > 0
            ) {
                await redisClient.del(
                    result.keys
                );
            }
        } while (cursor !== "0");
    }
}

export const redisCache =
    new RedisCache();
