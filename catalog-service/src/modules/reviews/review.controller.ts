import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { ReviewService } from "./review.service.js";

import {
    createReviewSchema,
    updateReviewSchema,
} from "./validation/review.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";

export type ReviewParams = {
    reviewId: string;
};

export type ServiceParams = {
    serviceId: string;
};

export class ReviewController {
    private readonly reviewService =
        new ReviewService();

    async createReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createReviewSchema.parse(
                    req.body
                );

            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });

                return;
            }

            const review =
                await this.reviewService.createReview(
                    data,
                    req.user.userId
                );

            sendSuccess(
                res,
                201,
                { review },
                "Review created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getReview(
        req: Request<ReviewParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const review =
                await this.reviewService.getReview(
                    req.params.reviewId
                );

            sendSuccess(
                res,
                200,
                { review }
            );
        } catch (error) {
            next(error);
        }
    }

    async getServiceReviews(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const pagination =
                getPagination(req);

            const result =
                await this.reviewService
                    .getServiceReviews(
                        req.params.serviceId,
                        pagination
                    );

            sendSuccess(
                res,
                200,
                {
                    reviews:
                        result.reviews,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async getServiceRating(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const rating =
                await this.reviewService.getServiceRating(
                    req.params.serviceId
                );

            sendSuccess(
                res,
                200,
                { rating }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateReview(
        req: Request<ReviewParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });

                return;
            }

            const data =
                updateReviewSchema.parse(
                    req.body
                );

            const review =
                await this.reviewService.updateReview(
                    req.params.reviewId,
                    data,
                    req.user.userId
                );

            sendSuccess(
                res,
                200,
                { review },
                "Review updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(
        req: Request<ReviewParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });

                return;
            }

            await this.reviewService.deleteReview(
                req.params.reviewId,
                req.user.userId
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Review deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
