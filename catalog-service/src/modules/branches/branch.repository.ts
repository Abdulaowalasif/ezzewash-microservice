import {
    BranchModel,
    type IBranch,
} from "./branch.model.js";

export interface FindBranchesOptions {
    isActive?: boolean;
    skip: number;
    limit: number;
}

export class BranchRepository {
    async create(
        data: Partial<IBranch>
    ): Promise<IBranch> {
        return BranchModel.create(data);
    }

    async findById(
        branchId: string
    ): Promise<IBranch | null> {
        return BranchModel.findById(branchId);
    }

    async findByCode(
        code: string
    ): Promise<IBranch | null> {
        return BranchModel.findOne({
            code: code.toUpperCase(),
        });
    }

    async findAll(
        options: FindBranchesOptions
    ): Promise<IBranch[]> {
        const filter =
            typeof options.isActive === "boolean"
                ? {
                    isActive:
                        options.isActive,
                }
                : {};

        return BranchModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async count(
        isActive?: boolean
    ): Promise<number> {
        const filter =
            typeof isActive === "boolean"
                ? { isActive }
                : {};

        return BranchModel.countDocuments(
            filter
        );
    }

    async updateById(
        branchId: string,
        data: Partial<IBranch>
    ): Promise<IBranch | null> {
        return BranchModel.findByIdAndUpdate(
            branchId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        branchId: string,
    ): Promise<IBranch | null> {
        return BranchModel.findByIdAndDelete(
            branchId
        );
    }
}

