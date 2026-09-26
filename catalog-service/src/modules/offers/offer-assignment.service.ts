import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";

import {
    BranchAccessService,
} from "../branch-memberships/branch-access.service.js";

import {
    OfferAssignmentRepository,
} from "./offer-assignment.repository.js";

import {
    OfferRepository,
} from "./offer.repository.js";

import {
    OfferAudience,
} from "./offer.model.js";

import type {
    AssignUsersToOfferInput,
} from "./validation/offer-assignment.schema.js";

export class OfferAssignmentService {
    private readonly offerRepository =
        new OfferRepository();

    private readonly assignmentRepository =
        new OfferAssignmentRepository();

    private readonly branchAccessService =
        new BranchAccessService();

    async assignUsersToOffer(
        offerId: string,
        data: AssignUsersToOfferInput,
        user: AuthenticatedUser
    ): Promise<void> {
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

        await this.branchAccessService.assertCanManageBranch(
            user,
            offer.branchId.toString()
        );

        if (
            offer.audience !==
            OfferAudience.SPECIFIC_USERS
        ) {
            throw new AppError(
                "Users can only be assigned to specific-user offers",
                400
            );
        }

        const uniqueUserIds =
            [...new Set(data.userIds)];

        const userObjectIds =
            uniqueUserIds.map((userId) => {
                if (
                    !mongoose.Types.ObjectId.isValid(
                        userId
                    )
                ) {
                    throw new AppError(
                        `Invalid user ID: ${userId}`,
                        400
                    );
                }

                return new mongoose.Types.ObjectId(
                    userId
                );
            });

        await this.assignmentRepository.createMany(
            userObjectIds.map((userId) => ({
                offerId:
                    offer._id,
                userId,
            }))
        );
    }
}
