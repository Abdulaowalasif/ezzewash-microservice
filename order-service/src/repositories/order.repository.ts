import { Order, type IOrderAddress } from "../models/order.model.js";

export class OrderRepository {
    async create(data: {
        userId: string;
        branchId: string;
        branchName: string;
        pickupSlot: {
            date: string;
            time: string;
        };
        pickupAddress: IOrderAddress;
        deliverySlot: {
            date: string;
            time: string;
        };
        deliveryAddress: IOrderAddress;
        subtotal: number;
        discount: number;
        total: number;
    }) {
        return Order.create(data);
    }

    async findById(
        orderId: string
    ) {
        return Order.findById(
            orderId
        );
    }

    async findByUserId(
        userId: string,
        page: number,
        limit: number
    ) {
        const skip =
            (page - 1) * limit;

        const [orders, total] =
            await Promise.all([
                Order.find({
                    userId,
                })
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limit),

                Order.countDocuments({
                    userId,
                }),
            ]);

        return {
            orders,
            total,
            page,
            limit,
            totalPages:
                Math.ceil(total / limit),
        };
    }

    async updateStatus(
        orderId: string,
        status: string
    ) {
        return Order.findByIdAndUpdate(
            orderId,
            {
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async assignRider(
        orderId: string,
        riderId: string
    ) {
        return Order.findOneAndUpdate(
            {
                _id: orderId,
                riderId: {
                    $exists: false,
                },
            },
            {
                riderId,
            },
            {
                new: true,
                runValidators: true,
            }
        );
    }
}

export const orderRepository =
    new OrderRepository();