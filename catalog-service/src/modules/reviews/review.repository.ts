import { Types } from "mongoose";

import {
    ReviewModel,
    type IReview,
} from "./review.model.js";

export interface FindReviewsOptions {
    skip: number;
    limit: number;
}

export class ReviewRepository {
    async create(
        data: Partial<IReview>
    ): Promise<IReview> {
        return ReviewModel.create(data);
    }

    async findById(
        reviewId: string
    ): Promise<IReview | null> {
        return ReviewModel.findById(reviewId)
            .populate("serviceId");
    }

    async findByUserAndService(
        userId: string,
        serviceId: string
    ): Promise<IReview | null> {
        return ReviewModel.findOne({
            userId: new Types.ObjectId(userId),
            serviceId: new Types.ObjectId(serviceId),
        });
    }

    async findByService(
        serviceId: string,
        options: FindReviewsOptions
    ): Promise<IReview[]> {
        return ReviewModel.find({
            serviceId:
                new Types.ObjectId(serviceId),
        })
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async countByService(
        serviceId: string
    ): Promise<number> {
        return ReviewModel.countDocuments({
            serviceId:
                new Types.ObjectId(serviceId),
        });
    }

    async updateById(
        reviewId: string,
        data: Partial<IReview>
    ): Promise<IReview | null> {
        return ReviewModel.findByIdAndUpdate(
            reviewId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        reviewId: string
    ): Promise<IReview | null> {
        return ReviewModel.findByIdAndDelete(
            reviewId
        );
    }

    async getRatingSummary(
        serviceId: string
    ): Promise<{
        averageRating: number;
        reviewCount: number;
    }> {
        const result =
            await ReviewModel.aggregate([
                {
                    $match: {
                        serviceId:
                            new Types.ObjectId(
                                serviceId
                            ),
                    },
                },
                {
                    $group: {
                        _id: "$serviceId",
                        averageRating: {
                            $avg: "$rating",
                        },
                        reviewCount: {
                            $sum: 1,
                        },
                    },
                },
            ]);

        if (result.length === 0) {
            return {
                averageRating: 0,
                reviewCount: 0,
            };
        }

        return {
            averageRating:
                Math.round(
                    result[0].averageRating * 10
                ) / 10,

            reviewCount:
                result[0].reviewCount,
        };
    }
}
