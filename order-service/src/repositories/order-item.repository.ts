import { OrderItem } from "../models/order-item.model.js";

export class OrderItemRepository {
    async createMany(
        items: {
            orderId: string;
            serviceId: string;
            serviceName: string;
            itemId: string;
            itemName: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[]
    ) {
        return OrderItem.insertMany(
            items
        );
    }

    async findByOrderId(
        orderId: string
    ) {
        return OrderItem.find({
            orderId,
        }).sort({
            createdAt: 1,
        });
    }
}

export const orderItemRepository =
    new OrderItemRepository();