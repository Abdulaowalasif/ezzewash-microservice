import {
    BranchRepository,
} from "./branch.repository.js";

import type {
    IBranch,
} from "./branch.model.js";

import {
    AppError,
} from "../../infrastructure/http/app-error.js";

import {
    getPaginationMeta,
} from "../../infrastructure/http/pagination.js";

import type {
    Pagination,
} from "../../infrastructure/http/pagination.js";

export class BranchService {
    private readonly branchRepository =
        new BranchRepository();

    async createBranch(
        data: Partial<IBranch>
    ): Promise<IBranch> {
        const existingBranch =
            await this.branchRepository.findByCode(
                data.code as string
            );

        if (existingBranch) {
            throw new AppError(
                "Branch code already exists",
                409
            );
        }

        return this.branchRepository.create({
            ...data,
            code: (
                data.code as string
            ).toUpperCase(),
        });
    }

    async getBranch(
        branchId: string
    ): Promise<IBranch> {
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

        return branch;
    }

    async getBranches(
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        branches: IBranch[];
        pagination: ReturnType<
            typeof getPaginationMeta
        >;
    }> {
        const [
            branches,
            total,
        ] = await Promise.all([
            this.branchRepository.findAll({
                isActive,
                skip: pagination.skip,
                limit: pagination.limit,
            }),

            this.branchRepository.count(
                isActive
            ),
        ]);

        return {
            branches,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async updateBranch(
        branchId: string,
        data: Partial<IBranch>
    ): Promise<IBranch> {
        const branch =
            await this.branchRepository.updateById(
                branchId,
                data
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }

        return branch;
    }

    async updateBranchStatus(
        branchId: string,
        isActive: boolean
    ): Promise<IBranch> {
        const branch =
            await this.branchRepository.updateById(
                branchId,
                { isActive }
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }

        return branch;
    }

    async deleteBranch(
        branchId: string
    ): Promise<void> {
        const branch =
            await this.branchRepository.deleteById(
                branchId
            );

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404
            );
        }
    }
}
