import {
    ItemModel,
    type IItem,
} from "./item.model.js";

export interface FindItemsOptions {
    isActive?: boolean;
    skip: number;
    limit: number;
}

export class ItemRepository {
    async create(
        data: Partial<IItem>
    ): Promise<IItem> {
        return ItemModel.create(data);
    }

    async findById(
        itemId: string
    ): Promise<IItem | null> {
        return ItemModel.findById(itemId);
    }

    async findByCode(
        code: string
    ): Promise<IItem | null> {
        return ItemModel.findOne({
            code: code.toUpperCase(),
        });
    }

    async findAll(
        options: FindItemsOptions
    ): Promise<IItem[]> {
        const filter =
            typeof options.isActive === "boolean"
                ? {
                    isActive:
                        options.isActive,
                }
                : {};

        return ItemModel.find(filter)
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

        return ItemModel.countDocuments(
            filter
        );
    }

    async updateById(
        itemId: string,
        data: Partial<IItem>
    ): Promise<IItem | null> {
        return ItemModel.findByIdAndUpdate(
            itemId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        itemId: string
    ): Promise<IItem | null> {
        return ItemModel.findByIdAndDelete(
            itemId
        );
    }
}
