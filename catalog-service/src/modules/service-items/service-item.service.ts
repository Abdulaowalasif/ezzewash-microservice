import mongoose from "mongoose";

import { AppError } from "../../infrastructure/http/app-error.js";

import { BranchRepository } from "../branches/branch.repository.js";
import { ServiceRepository } from "../services/service.repository.js";
import { ItemRepository } from "../items/item.repository.js";
import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";
import { BranchAccessService } from "../branch-memberships/branch-access.service.js";

import {
    ServiceItemRepository,
} from "./service-item.repository.js";

import type { IServiceItem } from "./service-item.model.js";

import type {
    CreateServiceItemInput,
    UpdateServiceItemInput,
} from "./validation/service-item.schema.js";

export class ServiceItemService {
    private readonly serviceItemRepository =
        new ServiceItemRepository();

    private readonly serviceRepository =
        new ServiceRepository();

    private readonly itemRepository =
        new ItemRepository();

    private readonly branchRepository =
        new BranchRepository();

    private readonly branchAccessService =
        new BranchAccessService();

    async createServiceItem(
        data: CreateServiceItemInput,
        user: AuthenticatedUser
    ): Promise<IServiceItem> {
        if (
            !mongoose.Types.ObjectId.isValid(
                data.serviceId
            )
        ) {
            throw new AppError(
                "Invalid service ID",
                400
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                data.itemId
            )
        ) {
            throw new AppError(
                "Invalid item ID",
                400
            );
        }

        const service =
            await this.serviceRepository.findById(
                data.serviceId
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }
        await this.branchAccessService.assertCanManageBranch(
            user,
            service.branchId.toString()
        );

        const branch =
            await this.branchRepository.findById(
                service.branchId.toString()
            );

        if (!branch) {
            throw new AppError(
                "Service branch not found",
                404
            );
        }

        if (!branch.isActive) {
            throw new AppError(
                "Cannot add pricing to an inactive branch",
                400
            );
        }

        if (!service.isActive) {
            throw new AppError(
                "Cannot add pricing to an inactive service",
                400
            );
        }

        const item =
            await this.itemRepository.findById(
                data.itemId
            );

        if (!item) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        if (!item.isActive) {
            throw new AppError(
                "Cannot add an inactive item to a service",
                400
            );
        }

        const existing =
            await this.serviceItemRepository
                .findByServiceAndItem(
                    data.serviceId,
                    data.itemId
                );

        if (existing) {
            throw new AppError(
                "This item is already configured for this service",
                409
            );
        }

        return this.serviceItemRepository.create({
            serviceId:
                new mongoose.Types.ObjectId(
                    data.serviceId
                ),
            itemId:
                new mongoose.Types.ObjectId(
                    data.itemId
                ),
            price: data.price,
            currency: data.currency ?? "BDT",
            isActive: data.isActive ?? true,
        });
    }

    async getServiceItem(
        serviceItemId: string
    ): Promise<IServiceItem> {
        if (
            !mongoose.Types.ObjectId.isValid(
                serviceItemId
            )
        ) {
            throw new AppError(
                "Invalid service item ID",
                400
            );
        }

        const serviceItem =
            await this.serviceItemRepository.findById(
                serviceItemId
            );

        if (!serviceItem) {
            throw new AppError(
                "Service item not found",
                404
            );
        }

        return serviceItem;
    }

    async getServiceItems(
        serviceId: string,
        isActive?: boolean
    ): Promise<IServiceItem[]> {
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
                "Service not found",
                404
            );
        }

        return this.serviceItemRepository.findByService(
            serviceId,
            isActive
        );
    }

    async updateServiceItem(
        serviceItemId: string,
        data: UpdateServiceItemInput,
        user: AuthenticatedUser
    ): Promise<IServiceItem> {
        if (
            !mongoose.Types.ObjectId.isValid(
                serviceItemId
            )
        ) {
            throw new AppError(
                "Invalid service item ID",
                400
            );
        }

        const serviceItem =
            await this.serviceItemRepository.findById(
                serviceItemId
            );

        if (!serviceItem) {
            throw new AppError(
                "Service item not found",
                404
            );
        }

        const service =
            await this.serviceRepository.findById(
                serviceItem.serviceId.toString()
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        await this.branchAccessService.assertCanManageBranch(
            user,
            service.branchId.toString()
        );

        const updated =
            await this.serviceItemRepository.updateById(
                serviceItemId,
                data
            );

        if (!updated) {
            throw new AppError(
                "Service item not found",
                404
            );
        }

        return updated;
    }

    async deleteServiceItem(
        serviceItemId: string,
        user: AuthenticatedUser
    ): Promise<void> {
        if (
            !mongoose.Types.ObjectId.isValid(
                serviceItemId
            )
        ) {
            throw new AppError(
                "Invalid service item ID",
                400
            );
        }

        const serviceItem =
            await this.serviceItemRepository.findById(
                serviceItemId
            );

        if (!serviceItem) {
            throw new AppError(
                "Service item not found",
                404
            );
        }

        const service =
            await this.serviceRepository.findById(
                serviceItem.serviceId.toString()
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404
            );
        }

        await this.branchAccessService.assertCanManageBranch(
            user,
            service.branchId.toString()
        );

        const deleted =
            await this.serviceItemRepository.deleteById(
                serviceItemId
            );

        if (!deleted) {
            throw new AppError(
                "Service item not found",
                404
            );
        }
    }
}