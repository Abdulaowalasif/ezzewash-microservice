import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";
import { BranchMembershipRepository } from "./branch-membership.repository.js";

export class BranchAccessService {
    private readonly membershipRepository =
        new BranchMembershipRepository();

    async assertSuperAdmin(
        user: AuthenticatedUser
    ): Promise<void> {
        if (user.role !== "SUPER_ADMIN") {
            throw new AppError(
                "SUPER_ADMIN access required",
                403
            );
        }
    }

    async assertCanManageBranch(
        user: AuthenticatedUser,
        branchId: string
    ): Promise<void> {
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

        // SUPER_ADMIN can manage every branch.
        if (user.role === "SUPER_ADMIN") {
            return;
        }

        // Only ADMIN can manage catalog data.
        if (user.role !== "ADMIN") {
            throw new AppError(
                "Branch administration access required",
                403
            );
        }

        const membership =
            await this.membershipRepository
                .findByUserAndBranch(
                    user.userId,
                    branchId
                );

        if (
            !membership ||
            !membership.isActive
        ) {
            throw new AppError(
                "You are not assigned to this branch",
                403
            );
        }
    }
}