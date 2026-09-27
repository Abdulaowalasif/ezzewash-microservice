import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    createCapacitySlotSchema,
    availableCapacitySlotSchema,
} from "../schemas/capacity-slot.schema.js";

import {
    capacitySlotService,
} from "../services/capacity-slot.service.js";

export class CapacitySlotController {
    async createSlot(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createCapacitySlotSchema.parse(
                    req.body
                );

            const slot =
                await capacitySlotService.createSlot(
                    data,
                    req.user!.userId
                );

            res.status(201).json({
                success: true,
                data: slot,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAvailableSlots(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                availableCapacitySlotSchema.parse(
                    req.query
                );

            const slots =
                await capacitySlotService
                    .getAvailableSlots(
                        data.branchId,
                        data.date,
                        data.type
                    );

            res.status(200).json({
                success: true,
                data: slots,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const capacitySlotController =
    new CapacitySlotController();
