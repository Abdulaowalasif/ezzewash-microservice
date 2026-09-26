import { Types } from "mongoose";

import {
    ServiceItemModel,
    type IServiceItem,
} from "./service-item.model.js";

export class ServiceItemRepository {
    async create(
        data: Partial<IServiceItem>
    ): Promise<IServiceItem> {
        return ServiceItemModel.create(data);
    }

    async findById(
        serviceItemId: string
    ): Promise<IServiceItem | null> {
        return ServiceItemModel.findById(
            serviceItemId
        );
    }

    async findByServiceAndItem(
        serviceId: string,
        itemId: string
    ): Promise<IServiceItem | null> {
        return ServiceItemModel.findOne({
            serviceId: new Types.ObjectId(serviceId),
            itemId: new Types.ObjectId(itemId),
        });
    }

    async findByService(
        serviceId: string,
        isActive?: boolean
    ): Promise<IServiceItem[]> {
        const filter: {
            serviceId: Types.ObjectId;
            isActive?: boolean;
        } = {
            serviceId: new Types.ObjectId(serviceId),
        };

        if (typeof isActive === "boolean") {
            filter.isActive = isActive;
        }

        return ServiceItemModel.find(filter)
            .populate("itemId")
            .sort({ createdAt: -1 });
    }

    async updateById(
        serviceItemId: string,
        data: Partial<IServiceItem>
    ): Promise<IServiceItem | null> {
        return ServiceItemModel.findByIdAndUpdate(
            serviceItemId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        serviceItemId: string
    ): Promise<IServiceItem | null> {
        return ServiceItemModel.findByIdAndDelete(
            serviceItemId
        );
    }
}