import { AppError } from "../../../infrastructure/http/app-error.js";
import { JwtService } from "../../../infrastructure/jwt/jwt.service.js";
import { UserRepository } from "../../users/user.repository.js";
import {
    getRefreshToken,
    saveRefreshToken,
    deleteRefreshToken,
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

        const storedToken = await getRefreshToken(payload.jti);

        if (!storedToken) {
            throw new AppError("Refresh token is invalid or expired", 401);
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

        // Invalidate the old refresh token
        await deleteRefreshToken(payload.jti);

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
            newRefreshPayload.userId
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}