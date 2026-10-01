import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    createOrderSchema,
    updateOrderStatusSchema,
    orderPaginationSchema,
    assignRiderSchema,
} from "../schemas/order.schema.js";

import {
    orderService,
} from "../services/order.service.js";

export class OrderController {
    async createOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createOrderSchema.parse(
                    req.body
                );

            const userId =
                req.user!.userId;

            const order =
                await orderService.createOrder(
                    userId,
                    data
                );

            res.status(201).json({
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
                await orderService.getOrderWithItems(
                    orderId,
                    req.user!.userId,
                    req.user!.role
                );

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserOrders(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId =
                req.user!.userId;

            const pagination =
                orderPaginationSchema.parse(
                    req.query
                );

            const page =
                pagination.page;

            const limit =
                pagination.limit;

            const orders =
                await orderService.getUserOrders(
                    userId,
                    page,
                    limit
                );

            res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }

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


    async assignRider(
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
                assignRiderSchema.parse(
                    req.body
                );

            const authorization =
                req.headers.authorization;

            if (!authorization) {
                throw new Error(
                    "Authorization header is required"
                );
            }

            const order =
                await orderService.assignRider(
                    orderId,
                    data.riderId,
                    authorization
                );

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const orderController =
    new OrderController();