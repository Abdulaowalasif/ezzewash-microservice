import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    updateOrderStatusSchema,
} from "../schemas/order.schema.js";

import {
    orderService,
} from "../services/order.service.js";
import { orderItemRepository } from "../repositories/order-item.repository.js";
import { AppError } from "../utils/app-error.js";

export class InternalOrderController {
    async updateOrderStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const orderId =
                req.params.orderId;

            if (
                typeof orderId !== "string"
            ) {
                throw new Error(
                    "Invalid order ID"
                );
            }

            const data =
                updateOrderStatusSchema.parse(
                    req.body
                );

            const order =
                await orderService.updateOrderStatus(
                    orderId,
                    data.status
                );

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const orderId =
                req.params.orderId;

            if (
                typeof orderId !== "string"
            ) {
                throw new Error(
                    "Invalid order ID"
                );
            }

            const order =
                await orderService.getOrder(
                    orderId
                );

            if (!order) {
                throw new AppError(
                    404,
                    "Order not found"
                );
            }

            const items =
                await orderItemRepository.findByOrderId(
                    orderId
                );

            res.status(200).json({
                success: true,
                data: {
                    order,
                    items,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const internalOrderController =
    new InternalOrderController();
