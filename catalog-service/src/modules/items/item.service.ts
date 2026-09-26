import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedUser } from "../../infrastructure/http/auth.types.js";

import { BranchAccessService } from "../branch-memberships/branch-access.service.js";

import { ItemRepository } from "./item.repository.js";

import type { IItem } from "./item.model.js";

import type {
    CreateItemInput,
    UpdateItemInput,
} from "./validation/item.schema.js";
import { getPaginationMeta, Pagination } from "../../infrastructure/http/pagination.js";

export class ItemService {
    private readonly itemRepository =
        new ItemRepository();

    private readonly branchAccessService =
        new BranchAccessService();

    async createItem(
        data: CreateItemInput,
        user: AuthenticatedUser
    ): Promise<IItem> {
        await this.branchAccessService.assertSuperAdmin(
            user
        );

        const existingItem =
            await this.itemRepository.findByCode(
                data.code
            );

        if (existingItem) {
            throw new AppError(
                "Item code already exists",
                409
            );
        }

        return this.itemRepository.create({
            name: data.name,
            code: data.code,
            description: data.description,
            isActive: data.isActive ?? true,
        });
    }

    async getItem(
        itemId: string
    ): Promise<IItem> {
        const item =
            await this.itemRepository.findById(
                itemId
            );

        if (!item) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        return item;
    }

    async getItems(
        isActive: boolean | undefined,
        pagination: Pagination
    ): Promise<{
        items: IItem[];
        pagination: ReturnType<
            typeof getPaginationMeta
        >;
    }> {
        const [
            items,
            total,
        ] = await Promise.all([
            this.itemRepository.findAll({
                isActive,
                skip: pagination.skip,
                limit: pagination.limit,
            }),

            this.itemRepository.count(
                isActive
            ),
        ]);

        return {
            items,

            pagination:
                getPaginationMeta(
                    pagination.page,
                    pagination.limit,
                    total
                ),
        };
    }

    async updateItem(
        itemId: string,
        data: UpdateItemInput,
        user: AuthenticatedUser
    ): Promise<IItem> {
        await this.branchAccessService.assertSuperAdmin(
            user
        );

        const item =
            await this.itemRepository.findById(
                itemId
            );

        if (!item) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        if (data.code) {
            const existingItem =
                await this.itemRepository.findByCode(
                    data.code
                );

            if (
                existingItem &&
                existingItem._id.toString() !== itemId
            ) {
                throw new AppError(
                    "Item code already exists",
                    409
                );
            }
        }

        const updated =
            await this.itemRepository.updateById(
                itemId,
                data
            );

        if (!updated) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        return updated;
    }

    async updateItemStatus(
        itemId: string,
        isActive: boolean,
        user: AuthenticatedUser
    ): Promise<IItem> {
        await this.branchAccessService.assertSuperAdmin(
            user
        );

        const item =
            await this.itemRepository.findById(
                itemId
            );

        if (!item) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        const updated =
            await this.itemRepository.updateById(
                itemId,
                { isActive }
            );

        if (!updated) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        return updated;
    }

    async deleteItem(
        itemId: string,
        user: AuthenticatedUser
    ): Promise<void> {
        await this.branchAccessService.assertSuperAdmin(
            user
        );

        const item =
            await this.itemRepository.findById(
                itemId
            );

        if (!item) {
            throw new AppError(
                "Item not found",
                404
            );
        }

        const deleted =
            await this.itemRepository.deleteById(
                itemId
            );

        if (!deleted) {
            throw new AppError(
                "Item not found",
                404
            );
        }
    }
}