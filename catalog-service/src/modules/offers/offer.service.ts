import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";

import { BranchRepository } from "../branches/branch.repository.js";
import { BranchAccessService } from "../branch-memberships/branch-access.service.js";
import { ServiceRepository } from "../services/service.repository.js";

import {
    OfferAssignmentRepository,
} from "./offer-assignment.repository.js";

import {
    OfferRepository,
} from "./offer.repository.js";

import {
    OfferAudience,
    type IOffer,
} from "./offer.model.js";

import type {
    CreateOfferInput,
    UpdateOfferInput,
} from "./validation/offer.schema.js";

import {
    getPaginationMeta,
} from "../../infrastructure/http/pagination.js";

import type {
    Pagination,
} from "../../infrastructure/http/pagination.js";
import { redisCache } from "../../infrastructure/redis/redis-cache.js";


const ACTIVE_OFFERS_CACHE_TTL = 60;

function activeOffersCacheKey(
    branchId: string
): string {
    return `catalog:offers:active:${branchId}`;
}


export class OfferService {

    private readonly offerRepository =
        new OfferRepository();

    private readonly offerAssignmentRepository =
        new OfferAssignmentRepository();

    private readonly branchRepository =
        new BranchRepository();

    private readonly serviceRepository =
        new ServiceRepository();

    private readonly branchAccessService =
        new BranchAccessService();

    async getOffer(
        offerId: string
    ): Promise<IOffer> {
        if (
            !mongoose.Types.ObjectId.isValid(
                offerId
            )
        ) {
            throw new AppError(
                "Invalid offer ID",
                400
            );
        }

        const offer =
            await this.offerRepository.findById(
                offerId
            );

        if (!offer) {
            throw new AppError(
                "Offer not found",
                404
            );
        }

        return offer;
    }

    async getOffersByBranch(
        branchId: string,
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        offers: IOffer[];
        pagination: ReturnType<
            typeof getPaginationMeta
        >;
    }> {
        if (
            !mongoose.Types.ObjectId.isValid(
                branchId
            )
        ) {
            throw new AppError(
                "Invalid branch ID",
                400
            );
        }

        const branch =
            await this.branchRepository.findById(
                branchId
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }

        const [
            offers,
            total,
        ] = await Promise.all([
            this.offerRepository.findByBranch({
                branchId,
                isActive,
                skip: pagination.skip,
                limit: pagination.limit,
            }),

            this.offerRepository.countByBranch(
                branchId,
                isActive
            ),
        ]);

        return {
            offers,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async getActiveOffers(
        branchId: string
    ): Promise<IOffer[]> {
        if (
            !mongoose.Types.ObjectId.isValid(
                branchId
            )
        ) {
            throw new AppError(
                "Invalid branch ID",
                400
            );
        }

        const cacheKey =
            activeOffersCacheKey(
                branchId
            );

        const cached =
            await redisCache.get<IOffer[]>(
                cacheKey
            );

        if (cached) {
            return cached;
        }

        const branch =
            await this.branchRepository.findById(
                branchId
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }

        const offers =
            await this.offerRepository.findActiveForBranch(
                branchId
            );

        await redisCache.set(
            cacheKey,
            offers,
            ACTIVE_OFFERS_CACHE_TTL
        );

        return offers;
    }

    async createOffer(
        data: CreateOfferInput,
        user: AuthenticatedUser
    ): Promise<IOffer> {
        if (
            !mongoose.Types.ObjectId.isValid(
                data.branchId
            )
        ) {
            throw new AppError(
                "Invalid branch ID",
                400
            );
        }

        await this.branchAccessService.assertCanManageBranch(
            user,
            data.branchId
        );

        const branch =
            await this.branchRepository.findById(
                data.branchId
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }

        if (!branch.isActive) {
            throw new AppError(
                "Cannot create an offer for an inactive branch",
                400
            );
        }

        const uniqueServiceIds =
            [...new Set(data.serviceIds)];

        for (const serviceId of uniqueServiceIds) {
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
                    `Service not found: ${serviceId}`,
                    404
                );
            }

            if (
                service.branchId.toString() !==
                data.branchId
            ) {
                throw new AppError(
                    "All selected services must belong to the same branch",
                    400
                );
            }

            if (!service.isActive) {
                throw new AppError(
                    "An offer cannot target an inactive service",
                    400
                );
            }
        }

        const offer =
            await this.offerRepository.create({
                branchId:
                    new mongoose.Types.ObjectId(
                        data.branchId
                    ),

                name: data.name,

                description:
                    data.description,

                audience:
                    data.audience,

                discountType:
                    data.discountType,

                discountValue:
                    data.discountValue,

                minimumOrderAmount:
                    data.minimumOrderAmount,

                maximumDiscountAmount:
                    data.maximumDiscountAmount,

                serviceIds:
                    uniqueServiceIds.map(
                        (serviceId) =>
                            new mongoose.Types.ObjectId(
                                serviceId
                            )
                    ),

                startAt: data.startAt,

                endAt: data.endAt,

                isActive:
                    data.isActive ?? true,
            });

        await this.invalidateActiveOffersCache(
            data.branchId
        );

        return offer;
    }

    async updateOffer(
        offerId: string,
        data: UpdateOfferInput,
        user: AuthenticatedUser
    ): Promise<IOffer> {
        const offer =
            await this.getOffer(offerId);

        await this.branchAccessService.assertCanManageBranch(
            user,
            offer.branchId.toString()
        );

        const {
            serviceIds,
            ...otherUpdates
        } = data;

        const updateData: Partial<IOffer> = {
            ...otherUpdates,
        };

        if (serviceIds) {
            const uniqueServiceIds =
                [...new Set(serviceIds)];

            for (const serviceId of uniqueServiceIds) {
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
                    await this.serviceRepository
                        .findById(serviceId);

                if (!service) {
                    throw new AppError(
                        `Service not found: ${serviceId}`,
                        404
                    );
                }

                if (
                    service.branchId.toString() !==
                    offer.branchId.toString()
                ) {
                    throw new AppError(
                        "All selected services must belong to the offer branch",
                        400
                    );
                }

                if (!service.isActive) {
                    throw new AppError(
                        "An offer cannot target an inactive service",
                        400
                    );
                }
            }

            Object.assign(updateData, {
                serviceIds:
                    uniqueServiceIds.map(
                        (serviceId) =>
                            new mongoose.Types.ObjectId(
                                serviceId
                            )
                    ),
            });
        }

        const updated =
            await this.offerRepository.updateById(
                offerId,
                updateData
            );

        if (!updated) {
            throw new AppError(
                "Offer not found",
                404
            );
        }

        if (
            data.audience ===
            OfferAudience.ALL_USERS &&
            offer.audience ===
            OfferAudience.SPECIFIC_USERS
        ) {
            await this.offerAssignmentRepository
                .deleteByOffer(offerId);
        }

        await this.invalidateActiveOffersCache(
            offer.branchId.toString()
        );

        return updated;
    }

    async updateOfferStatus(
        offerId: string,
        isActive: boolean,
        user: AuthenticatedUser
    ): Promise<IOffer> {
        const offer =
            await this.getOffer(offerId);

        await this.branchAccessService.assertCanManageBranch(
            user,
            offer.branchId.toString()
        );

        const updated =
            await this.offerRepository.updateById(
                offer._id.toString(),
                {
                    isActive,
                }
            );

        if (!updated) {
            throw new AppError(
                "Offer not found",
                404
            );
        }

        await this.invalidateActiveOffersCache(
            offer.branchId.toString()
        );

        return updated;
    }

    async deleteOffer(
        offerId: string,
        user: AuthenticatedUser
    ): Promise<void> {
        const offer =
            await this.getOffer(offerId);

        await this.branchAccessService.assertCanManageBranch(
            user,
            offer.branchId.toString()
        );

        const deleted =
            await this.offerRepository.deleteById(
                offerId
            );

        if (!deleted) {
            throw new AppError(
                "Offer not found",
                404
            );
        }

        await this.offerAssignmentRepository
            .deleteByOffer(offerId);

        await this.invalidateActiveOffersCache(
            offer.branchId.toString()
        );
    }

    private async invalidateActiveOffersCache(
        branchId: string
    ): Promise<void> {
        await redisCache.delete(
            activeOffersCacheKey(
                branchId
            )
        );
    }

}
