import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";
import { ServiceRepository } from "../services/service.repository.js";
import {
    ReviewRepository,
} from "./review.repository.js";

import type { IReview } from "./review.model.js";

import type {
    CreateReviewInput,
    UpdateReviewInput,
} from "./validation/review.schema.js";

import {
    getPaginationMeta,
} from "../../infrastructure/http/pagination.js";

import type {
    Pagination,
} from "../../infrastructure/http/pagination.js";

export class ReviewService {
    private readonly reviewRepository =
        new ReviewRepository();

    private readonly serviceRepository =
        new ServiceRepository();

    async createReview(
        data: CreateReviewInput,
        userId: string
    ): Promise<IReview> {
        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {
            throw new AppError(
                "Invalid user ID",
                400
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                data.serviceId
            )
        ) {
            throw new AppError(
                "Invalid service ID",
                400
            );
        }

        const service =
            await this.serviceRepository.findById(
                data.serviceId
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        if (!service.isActive) {
            throw new AppError(
                "Cannot review an inactive service",
                400
            );
        }

        const existingReview =
            await this.reviewRepository
                .findByUserAndService(
                    userId,
                    data.serviceId
                );

        if (existingReview) {
            throw new AppError(
                "You have already reviewed this service",
                409
            );
        }

        return this.reviewRepository.create({
            userId:
                new mongoose.Types.ObjectId(
                    userId
                ),

            serviceId:
                new mongoose.Types.ObjectId(
                    data.serviceId
                ),

            rating: data.rating,

            comment: data.comment,
        });
    }

    async getReview(
        reviewId: string
    ): Promise<IReview> {
        if (
            !mongoose.Types.ObjectId.isValid(
                reviewId
            )
        ) {
            throw new AppError(
                "Invalid review ID",
                400
            );
        }

        const review =
            await this.reviewRepository.findById(
                reviewId
            );

        if (!review) {
            throw new AppError(
                "Review not found",
                404
            );
        }

        return review;
    }

    async getServiceReviews(
        serviceId: string,
        pagination: Pagination
    ): Promise<{
        reviews: IReview[];
        pagination: ReturnType<
            typeof getPaginationMeta
        >;
    }> {
        if (
            !mongoose.Types.ObjectId.isValid(
                serviceId
            )
        ) {
            throw new AppError(
                "Invalid service ID",
                400
            );
        }

        const service =
            await this.serviceRepository.findById(
                serviceId
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        const [
            reviews,
            total,
        ] = await Promise.all([
            this.reviewRepository.findByService(
                serviceId,
                {
                    skip: pagination.skip,
                    limit: pagination.limit,
                }
            ),

            this.reviewRepository.countByService(
                serviceId
            ),
        ]);

        return {
            reviews,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async getServiceRating(
        serviceId: string
    ): Promise<{
        averageRating: number;
        reviewCount: number;
    }> {
        if (
            !mongoose.Types.ObjectId.isValid(
                serviceId
            )
        ) {
            throw new AppError(
                "Invalid service ID",
                400
            );
        }

        const service =
            await this.serviceRepository.findById(
                serviceId
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        return this.reviewRepository
            .getRatingSummary(serviceId);
    }

    private assertReviewOwner(
        review: IReview,
        userId: string
    ): void {
        if (
            review.userId.toString() !== userId
        ) {
            throw new AppError(
                "You are not allowed to modify this review",
                403
            );
        }
    }

    async updateReview(
        reviewId: string,
        data: UpdateReviewInput,
        userId: string
    ): Promise<IReview> {
        if (
            !mongoose.Types.ObjectId.isValid(
                reviewId
            )
        ) {
            throw new AppError(
                "Invalid review ID",
                400
            );
        }

        const review =
            await this.reviewRepository.findById(
                reviewId
            );

        if (!review) {
            throw new AppError(
                "Review not found",
                404
            );
        }

        this.assertReviewOwner(
            review,
            userId
        );

        const updated =
            await this.reviewRepository.updateById(
                reviewId,
                data
            );

        if (!updated) {
            throw new AppError(
                "Review not found",
                404
            );
        }

        return updated;
    }

    async deleteReview(
        reviewId: string,
        userId: string
    ): Promise<void> {
        if (
            !mongoose.Types.ObjectId.isValid(
                reviewId
            )
        ) {
            throw new AppError(
                "Invalid review ID",
                400
            );
        }

        const review =
            await this.reviewRepository.findById(
                reviewId
            );

        if (!review) {
            throw new AppError(
                "Review not found",
                404
            );
        }

        this.assertReviewOwner(
            review,
            userId
        );

        const deleted =
            await this.reviewRepository.deleteById(
                reviewId
            );

        if (!deleted) {
            throw new AppError(
                "Review not found",
                404
            );
        }
    }
}
