import { redisClient } from "../../../infrastructure/redis/redis.js";

export async function saveOtp(
    email: string,
    purpose: string,
    otp: string
): Promise<void> {
    const key = `otp:${purpose}:${email}`;

    await redisClient.set(key, otp, {
        EX: 5 * 60,
    });
}

export async function getOtp(
    email: string,
    purpose: string
): Promise<string | null> {
    const key = `otp:${purpose}:${email}`;

    return redisClient.get(key);
}

export async function deleteOtp(
    email: string,
    purpose: string
): Promise<void> {
    const key = `otp:${purpose}:${email}`;

    await redisClient.del(key);
}


export async function incrementOtpAttempts(
    email: string,
    purpose: string
): Promise<number> {
    const key = `otp_attempts:${purpose}:${email}`;

    const attempts = await redisClient.incr(key);

    if (attempts === 1) {
        await redisClient.expire(
            key,
            5 * 60
        );
    }

    return attempts;
}


export async function deleteOtpAttempts(
    email: string,
    purpose: string
): Promise<void> {
    const key = `otp_attempts:${purpose}:${email}`;

    await redisClient.del(key);
}