import mongoose from "mongoose";

import {
    AppError,
} from "../../infrastructure/http/app-error.js";

import {
    BranchRepository,
} from "../branches/branch.repository.js";

import {
    BranchMembershipRepository,
} from "./branch-membership.repository.js";

import type {
    IBranchMembership,
} from "./branch-membership.model.js";

import type {
    CreateBranchMembershipInput,
    UpdateBranchMembershipInput,
} from "./validation/branch-membership.schema.js";

import {
    getPaginationMeta,
} from "../../infrastructure/http/pagination.js";

import type {
    Pagination,
} from "../../infrastructure/http/pagination.js";

export class BranchMembershipService {
    private readonly membershipRepository =
        new BranchMembershipRepository();

    private readonly branchRepository =
        new BranchRepository();

    async createMembership(
        data: CreateBranchMembershipInput
    ): Promise<IBranchMembership> {
        if (
            !mongoose.Types.ObjectId.isValid(
                data.userId
            )
        ) {
            throw new AppError(
                "Invalid user ID",
                400
            );
        }

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
                "Cannot assign a user to an inactive branch",
                400
            );
        }

        const existing =
            await this.membershipRepository
                .findByUserAndBranch(
                    data.userId,
                    data.branchId
                );

        if (existing) {
            throw new AppError(
                "User is already assigned to this branch",
                409
            );
        }

        return this.membershipRepository.create({
            userId:
                new mongoose.Types.ObjectId(
                    data.userId
                ),

            branchId:
                new mongoose.Types.ObjectId(
                    data.branchId
                ),

            isActive:
                data.isActive ?? true,
        });
    }

    async getMembership(
        membershipId: string
    ): Promise<IBranchMembership> {
        if (
            !mongoose.Types.ObjectId.isValid(
                membershipId
            )
        ) {
            throw new AppError(
                "Invalid membership ID",
                400
            );
        }

        const membership =
            await this.membershipRepository.findById(
                membershipId
            );

        if (!membership) {
            throw new AppError(
                "Branch membership not found",
                404
            );
        }

        return membership;
    }

    async getUserMemberships(
        userId: string,
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        memberships: IBranchMembership[];
        pagination: ReturnType<
            typeof getPaginationMeta
        >;
    }> {
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

        const [
            memberships,
            total,
        ] = await Promise.all([
            this.membershipRepository.findByUser(
                userId,
                {
                    isActive,
                    skip: pagination.skip,
                    limit: pagination.limit,
                }
            ),

            this.membershipRepository.countByUser(
                userId,
                isActive
            ),
        ]);

        return {
            memberships,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async getBranchMemberships(
        branchId: string,
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        memberships: IBranchMembership[];
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
            memberships,
            total,
        ] = await Promise.all([
            this.membershipRepository.findByBranch(
                branchId,
                {
                    isActive,
                    skip: pagination.skip,
                    limit: pagination.limit,
                }
            ),

            this.membershipRepository.countByBranch(
                branchId,
                isActive
            ),
        ]);

        return {
            memberships,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async updateMembership(
        membershipId: string,
        data: UpdateBranchMembershipInput
    ): Promise<IBranchMembership> {
        const membership =
            await this.getMembership(
                membershipId
            );

        const updated =
            await this.membershipRepository
                .updateById(
                    membership._id.toString(),
                    data
                );

        if (!updated) {
            throw new AppError(
                "Branch membership not found",
                404
            );
        }

        return updated;
    }

    async deleteMembership(
        membershipId: string
    ): Promise<void> {
        const deleted =
            await this.membershipRepository
                .deleteById(
                    membershipId
                );

        if (!deleted) {
            throw new AppError(
                "Branch membership not found",
                404
            );
        }
    }
}