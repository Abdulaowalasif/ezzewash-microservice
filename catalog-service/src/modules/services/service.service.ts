import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";

import { BranchRepository } from "../branches/branch.repository.js";

import { ServiceRepository } from "./service.repository.js";

import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";

import { BranchAccessService } from "../branch-memberships/branch-access.service.js";

import type {
    CreateServiceInput,
    UpdateServiceInput,
} from "./validation/service.schema.js";

import type { IService } from "./service.model.js";

import {
    getPaginationMeta,
} from "../../infrastructure/http/pagination.js";

import type {
    Pagination,
} from "../../infrastructure/http/pagination.js";

export class ServiceService {
    private readonly serviceRepository =
        new ServiceRepository();

    private readonly branchAccessService =
        new BranchAccessService();

    private readonly branchRepository =
        new BranchRepository();

    async createService(
        data: CreateServiceInput,
        user: AuthenticatedUser
    ): Promise<IService> {
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

        await this.branchAccessService
            .assertCanManageBranch(
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
                "Cannot create a service for an inactive branch",
                400
            );
        }

        const existingService =
            await this.serviceRepository
                .findByBranchAndCode(
                    data.branchId,
                    data.code
                );

        if (existingService) {
            throw new AppError(
                "Service code already exists in this branch",
                409
            );
        }

        return this.serviceRepository.create({
            branchId:
                new mongoose.Types.ObjectId(
                    data.branchId
                ),

            name: data.name,

            code: data.code,

            description:
                data.description,

            isActive:
                data.isActive ?? true,
        });
    }

    async getService(
        serviceId: string
    ): Promise<IService> {
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

        return service;
    }

    async getServicesByBranch(
        branchId: string,
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        services: IService[];
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
            services,
            total,
        ] = await Promise.all([
            this.serviceRepository.findByBranch({
                branchId,

                isActive,

                skip:
                    pagination.skip,

                limit:
                    pagination.limit,
            }),

            this.serviceRepository.countByBranch(
                branchId,
                isActive
            ),
        ]);

        return {
            services,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async updateService(
        serviceId: string,
        data: UpdateServiceInput,
        user: AuthenticatedUser
    ): Promise<IService> {
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

        await this.branchAccessService
            .assertCanManageBranch(
                user,
                service.branchId.toString()
            );

        if (data.code) {
            const existingService =
                await this.serviceRepository
                    .findByBranchAndCode(
                        service.branchId.toString(),
                        data.code
                    );

            if (
                existingService &&
                existingService._id.toString() !==
                serviceId
            ) {
                throw new AppError(
                    "Service code already exists in this branch",
                    409
                );
            }
        }

        const updated =
            await this.serviceRepository.updateById(
                serviceId,
                data
            );

        if (!updated) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        return updated;
    }

    async updateServiceStatus(
        serviceId: string,
        isActive: boolean,
        user: AuthenticatedUser
    ): Promise<IService> {
        const service =
            await this.serviceRepository
                .findById(serviceId);

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        await this.branchAccessService
            .assertCanManageBranch(
                user,
                service.branchId.toString()
            );

        const updated =
            await this.serviceRepository.updateById(
                serviceId,
                {
                    isActive,
                }
            );

        if (!updated) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        return updated;
    }

    async deleteService(
        serviceId: string,
        user: AuthenticatedUser
    ): Promise<void> {
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

        await this.branchAccessService
            .assertCanManageBranch(
                user,
                service.branchId.toString()
            );

        const deleted =
            await this.serviceRepository.deleteById(
                serviceId
            );

        if (!deleted) {
            throw new AppError(
                "Service not found",
                404
            );
        }
    }
}
