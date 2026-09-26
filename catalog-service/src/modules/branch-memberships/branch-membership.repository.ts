import { Types } from "mongoose";

import {
    BranchMembershipModel,
    type IBranchMembership,
} from "./branch-membership.model.js";

export interface FindMembershipsOptions {
    isActive?: boolean;
    skip: number;
    limit: number;
}

export class BranchMembershipRepository {
    async create(
        data: Partial<IBranchMembership>
    ): Promise<IBranchMembership> {
        return BranchMembershipModel.create(data);
    }

    async findById(
        membershipId: string
    ): Promise<IBranchMembership | null> {
        return BranchMembershipModel.findById(
            membershipId
        );
    }

    async findByUserAndBranch(
        userId: string,
        branchId: string
    ): Promise<IBranchMembership | null> {
        return BranchMembershipModel.findOne({
            userId: new Types.ObjectId(userId),
            branchId: new Types.ObjectId(branchId),
        });
    }

    async findByUser(
        userId: string,
        options: FindMembershipsOptions
    ): Promise<IBranchMembership[]> {
        const filter: {
            userId: Types.ObjectId;
            isActive?: boolean;
        } = {
            userId: new Types.ObjectId(userId),
        };

        if (
            typeof options.isActive ===
            "boolean"
        ) {
            filter.isActive =
                options.isActive;
        }

        return BranchMembershipModel.find(filter)
            .populate("branchId")
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async countByUser(
        userId: string,
        isActive?: boolean
    ): Promise<number> {
        const filter: {
            userId: Types.ObjectId;
            isActive?: boolean;
        } = {
            userId: new Types.ObjectId(userId),
        };

        if (
            typeof isActive ===
            "boolean"
        ) {
            filter.isActive =
                isActive;
        }

        return BranchMembershipModel.countDocuments(
            filter
        );
    }

    async findByBranch(
        branchId: string,
        options: FindMembershipsOptions
    ): Promise<IBranchMembership[]> {
        const filter: {
            branchId: Types.ObjectId;
            isActive?: boolean;
        } = {
            branchId: new Types.ObjectId(
                branchId
            ),
        };

        if (
            typeof options.isActive ===
            "boolean"
        ) {
            filter.isActive =
                options.isActive;
        }

        return BranchMembershipModel.find(filter)
            .populate("branchId")
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async countByBranch(
        branchId: string,
        isActive?: boolean
    ): Promise<number> {
        const filter: {
            branchId: Types.ObjectId;
            isActive?: boolean;
        } = {
            branchId: new Types.ObjectId(
                branchId
            ),
        };

        if (
            typeof isActive ===
            "boolean"
        ) {
            filter.isActive =
                isActive;
        }

        return BranchMembershipModel.countDocuments(
            filter
        );
    }

    async updateById(
        membershipId: string,
        data: Partial<IBranchMembership>
    ): Promise<IBranchMembership | null> {
        return BranchMembershipModel.findByIdAndUpdate(
            membershipId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        membershipId: string
    ): Promise<IBranchMembership | null> {
        return BranchMembershipModel.findByIdAndDelete(
            membershipId
        );
    }
}
