import { AppError } from "../../../infrastructure/http/app-error.js";
import { JwtService } from "../../../infrastructure/jwt/jwt.service.js";
import { UserRepository } from "../../users/user.repository.js";
import {
    getRefreshToken,
    saveRefreshToken,
    deleteRefreshToken,
    getRefreshTokensForUser,
    deleteSessionForUser,
    deleteRefreshTokensForUser,
    getRevokedRefreshToken,
    revokeRefreshToken,
} from "./refresh-token.store.js";




export class RefreshTokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository
    ) { }

    async refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const payload =
            this.jwtService.verifyRefreshToken(refreshToken);

        const storedToken =
            await getRefreshToken(payload.jti);

        if (!storedToken) {
            const revokedToken =
                await getRevokedRefreshToken(
                    payload.jti
                );

            if (revokedToken) {
                await deleteRefreshTokensForUser(
                    revokedToken.userId
                );

                throw new AppError(
                    "Refresh token reuse detected",
                    401
                );
            }

            throw new AppError(
                "Refresh token is invalid or expired",
                401
            );
        }

        if (storedToken.userId !== payload.userId) {
            throw new AppError("Refresh token is invalid", 401);
        }

        const user = await this.userRepository.findById(
            payload.userId
        );

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (!user.isActive) {
            throw new AppError("Account is inactive", 403);
        }

        await revokeRefreshToken(
            payload.jti,
            payload.userId,
            storedToken.sessionId
        );

        await deleteRefreshToken(
            payload.jti
        );

        const newAccessToken =
            this.jwtService.generateAccessToken({
                userId: user._id.toString(),
                role: user.role,
            });

        const newRefreshToken =
            this.jwtService.generateRefreshToken({
                userId: user._id.toString(),
            });

        const newRefreshPayload =
            this.jwtService.verifyRefreshToken(
                newRefreshToken
            );

        await saveRefreshToken(
            newRefreshPayload.jti,
            payload.userId,
            storedToken.sessionId,
            storedToken.createdAt
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }


    async getSessions(
        userId: string
    ): Promise<
        Array<{
            sessionId: string;
            createdAt: string;
        }>
    > {
        const sessions =
            await getRefreshTokensForUser(userId);

        return sessions.map((session) => ({
            sessionId: session.sessionId,
            createdAt: session.createdAt,
        }));
    }


    async revokeSession(
        userId: string,
        sessionId: string
    ): Promise<void> {
        const deleted =
            await deleteSessionForUser(
                userId,
                sessionId
            );

        if (!deleted) {
            throw new AppError(
                "Session not found",
                404
            );
        }
    }

    async revokeAllSessions(
        userId: string
    ): Promise<void> {
        await deleteRefreshTokensForUser(userId);
    }

}