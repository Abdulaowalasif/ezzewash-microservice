import {
    CapacitySlot,
    type CapacitySlotType,
} from "../models/capacity-slot.model.js";

export class CapacitySlotRepository {
    async create(data: {
        branchId: string;
        date: string;
        time: string;
        type: CapacitySlotType;
        capacity: number;
    }) {
        return CapacitySlot.create(data);
    }

    async findBySlot(
        branchId: string,
        date: string,
        time: string,
        type: CapacitySlotType
    ) {
        return CapacitySlot.findOne({
            branchId,
            date,
            time,
            type,
        });
    }

    async findAvailableSlots(
        branchId: string,
        date: string,
        type: CapacitySlotType
    ) {
        return CapacitySlot.find({
            branchId,
            date,
            type,
            $expr: {
                $lt: ["$booked", "$capacity"],
            },
        }).sort({
            time: 1,
        });
    }

    async bookSlot(
        branchId: string,
        date: string,
        time: string,
        type: CapacitySlotType
    ) {
        return CapacitySlot.findOneAndUpdate(
            {
                branchId,
                date,
                time,
                type,
                $expr: {
                    $lt: ["$booked", "$capacity"],
                },
            },
            {
                $inc: {
                    booked: 1,
                },
            },
            {
                new: true,
            }
        );
    }

    async releaseSlot(
        branchId: string,
        date: string,
        time: string,
        type: CapacitySlotType
    ) {
        return CapacitySlot.findOneAndUpdate(
            {
                branchId,
                date,
                time,
                type,
                booked: {
                    $gt: 0,
                },
            },
            {
                $inc: {
                    booked: -1,
                },
            },
            {
                new: true,
            }
        );
    }
}

export const capacitySlotRepository =
    new CapacitySlotRepository();
