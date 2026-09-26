import { Types } from "mongoose";

import {
    ServiceModel,
    type IService,
} from "./service.model.js";

export interface FindServicesOptions {
    branchId: string;
    isActive?: boolean;
    skip: number;
    limit: number;
}

export class ServiceRepository {
    async create(
        data: Partial<IService>
    ): Promise<IService> {
        return ServiceModel.create(data);
    }

    async findById(
        serviceId: string
    ): Promise<IService | null> {
        return ServiceModel.findById(
            serviceId
        );
    }

    async findByBranchAndCode(
        branchId: string,
        code: string
    ): Promise<IService | null> {
        return ServiceModel.findOne({
            branchId: new Types.ObjectId(
                branchId
            ),
            code: code.toUpperCase(),
        });
    }

    async findByBranch(
        options: FindServicesOptions
    ): Promise<IService[]> {
        const filter: {
            branchId: Types.ObjectId;
            isActive?: boolean;
        } = {
            branchId: new Types.ObjectId(
                options.branchId
            ),
        };

        if (
            typeof options.isActive ===
            "boolean"
        ) {
            filter.isActive =
                options.isActive;
        }

        return ServiceModel.find(filter)
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

        return ServiceModel.countDocuments(
            filter
        );
    }

    async updateById(
        serviceId: string,
        data: Partial<IService>
    ): Promise<IService | null> {
        return ServiceModel.findByIdAndUpdate(
            serviceId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        serviceId: string
    ): Promise<IService | null> {
        return ServiceModel.findByIdAndDelete(
            serviceId
        );
    }
}