import {
    catalogClient,
} from "../clients/catalog.client.js";

import {
    orderRepository,
} from "../repositories/order.repository.js";

import {
    orderItemRepository,
} from "../repositories/order-item.repository.js";

import type {
    CreateOrderInput,
} from "../schemas/order.schema.js";

import {
    AppError,
} from "../utils/app-error.js";
import { capacitySlotService } from "./capacity-slot.service.js";
import { riderClient } from "../clients/rider.client.js";




const allowedTransitions: Record<
    string,
    string[]
> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["PROCESSING"],
    PROCESSING: ["READY"],
    READY: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};


export class OrderService {
    async createOrder(
        userId: string,
        data: CreateOrderInput
    ) {
        const branch =
            await catalogClient.getBranch(
                data.branchId
            );

        if (!branch.isActive) {
            throw new AppError(
                400,
                "Branch is inactive"
            );
        }

        const orderItems = [];

        for (const item of data.items) {
            const serviceItems =
                await catalogClient.getServiceItems(
                    item.serviceId
                );

            const serviceItem =
                serviceItems.find(
                    (serviceItem) =>
                        serviceItem.itemId._id === item.itemId &&
                        serviceItem.isActive
                );

            if (!serviceItem) {
                throw new AppError(
                    400,
                    "Item is not available for this service"
                );
            }

            const totalPrice =
                serviceItem.price * item.quantity;

            orderItems.push({
                serviceId: item.serviceId,
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: serviceItem.price,
                totalPrice,
            });
        }

        const subtotal =
            orderItems.reduce(
                (sum, item) =>
                    sum + item.totalPrice,
                0
            );

        await capacitySlotService.bookSlot(
            data.branchId,
            data.pickupSlot.date,
            data.pickupSlot.time,
            "PICKUP"
        );

        let deliveryBooked = false;

        try {
            await capacitySlotService.bookSlot(
                data.branchId,
                data.deliverySlot.date,
                data.deliverySlot.time,
                "DELIVERY"
            );

            deliveryBooked = true;

            const order =
                await orderRepository.create({
                    userId,
                    branchId: data.branchId,
                    pickupSlot: data.pickupSlot,
                    deliverySlot: data.deliverySlot,
                    subtotal,
                    discount: 0,
                    total: subtotal,
                });

            try {
                const itemsWithOrderId =
                    orderItems.map((item) => ({
                        ...item,
                        orderId: order.id,
                    }));

                await orderItemRepository.createMany(
                    itemsWithOrderId
                );
            } catch (error) {
                await capacitySlotService.releaseSlot(
                    data.branchId,
                    data.pickupSlot.date,
                    data.pickupSlot.time,
                    "PICKUP"
                );

                await capacitySlotService.releaseSlot(
                    data.branchId,
                    data.deliverySlot.date,
                    data.deliverySlot.time,
                    "DELIVERY"
                );

                throw error;
            }

            return order;
        } catch (error) {
            if (deliveryBooked) {
                await capacitySlotService.releaseSlot(
                    data.branchId,
                    data.deliverySlot.date,
                    data.deliverySlot.time,
                    "DELIVERY"
                );
            }

            await capacitySlotService.releaseSlot(
                data.branchId,
                data.pickupSlot.date,
                data.pickupSlot.time,
                "PICKUP"
            );

            throw error;
        }
    }


    async getOrder(
        orderId: string
    ) {
        return orderRepository.findById(
            orderId
        );
    }

    async getOrderWithItems(
        orderId: string,
        userId: string
    ) {
        const order =
            await orderRepository.findById(
                orderId
            );

        if (!order) {
            throw new AppError(
                404,
                "Order not found"
            );
        }

        if (order.userId !== userId) {
            throw new AppError(
                403,
                "You do not have access to this order"
            );
        }

        const items =
            await orderItemRepository.findByOrderId(
                orderId
            );

        return {
            order,
            items,
        };
    }

    async getUserOrders(
        userId: string,
        page: number,
        limit: number
    ) {
        return orderRepository.findByUserId(
            userId,
            page,
            limit
        );
    }


    async updateOrderStatus(
        orderId: string,
        status: string
    ) {
        const order =
            await orderRepository.findById(
                orderId
            );

        if (!order) {
            throw new AppError(
                404,
                "Order not found"
            );
        }

        if (order.status === status) {
            return order;
        }


        const allowedStatuses =
            allowedTransitions[
            order.status
            ] ?? [];

        if (
            !allowedStatuses.includes(status)
        ) {
            throw new AppError(
                400,
                `Cannot change order status from ${order.status} to ${status}`
            );
        }

        const updatedOrder =
            await orderRepository.updateStatus(
                orderId,
                status
            );

        if (
            updatedOrder &&
            status === "CANCELLED"
        ) {
            await capacitySlotService.releaseSlot(
                updatedOrder.branchId,
                updatedOrder.pickupSlot.date,
                updatedOrder.pickupSlot.time,
                "PICKUP"
            );

            await capacitySlotService.releaseSlot(
                updatedOrder.branchId,
                updatedOrder.deliverySlot.date,
                updatedOrder.deliverySlot.time,
                "DELIVERY"
            );
        }

        return updatedOrder;
    }

    async assignRider(
        orderId: string,
        riderId: string,
        authorization: string
    ) {
        const order =
            await orderRepository.findById(
                orderId
            );

        if (!order) {
            throw new AppError(
                404,
                "Order not found"
            );
        }

        if (
            order.status === "CANCELLED" ||
            order.status === "DELIVERED"
        ) {
            throw new AppError(
                400,
                "Cannot assign rider to this order"
            );
        }

        if (order.riderId) {
            throw new AppError(
                400,
                "Order already has a rider"
            );
        }

        await riderClient.createAssignment(
            {
                riderId,
                orderId,
            },
            authorization
        );

        const updatedOrder =
            await orderRepository.assignRider(
                orderId,
                riderId
            );

        if (!updatedOrder) {
            throw new AppError(
                400,
                "Order already has a rider"
            );
        }

        return updatedOrder;
    }
}

export const orderService =
    new OrderService();
