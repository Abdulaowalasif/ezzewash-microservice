import {
    capacitySlotRepository,
} from "../repositories/capacity-slot.repository.js";

import type {
    CapacitySlotType,
} from "../models/capacity-slot.model.js";

import {
    AppError,
} from "../utils/app-error.js";

import {
    catalogClient,
} from "../clients/catalog.client.js";

export class CapacitySlotService {
    async createSlot(
        data: {
            branchId: string;
            date: string;
            time: string;
            type: CapacitySlotType;
            capacity: number;
        },
        userId: string
    ) {
        const memberships =
            await catalogClient.getUserMemberships(
                userId
            );

        const hasBranchAccess =
            memberships.some(
                (membership) =>
                    membership.branchId._id ===
                    data.branchId &&
                    membership.isActive
            );

        if (!hasBranchAccess) {
            throw new AppError(
                403,
                "You do not have access to this branch"
            );
        }

        const existing =
            await capacitySlotRepository.findBySlot(
                data.branchId,
                data.date,
                data.time,
                data.type
            );

        if (existing) {
            throw new AppError(
                409,
                "Capacity slot already exists"
            );
        }

        return capacitySlotRepository.create(
            data
        );
    }

    async getAvailableSlots(
        branchId: string,
        date: string,
        type: CapacitySlotType
    ) {
        return capacitySlotRepository
            .findAvailableSlots(
                branchId,
                date,
                type
            );
    }

    async bookSlot(
        branchId: string,
        date: string,
        time: string,
        type: CapacitySlotType
    ) {
        const slot =
            await capacitySlotRepository.bookSlot(
                branchId,
                date,
                time,
                type
            );

        if (!slot) {
            throw new AppError(
                400,
                "Capacity slot is full or does not exist"
            );
        }

        return slot;
    }

    async releaseSlot(
        branchId: string,
        date: string,
        time: string,
        type: CapacitySlotType
    ) {
        return capacitySlotRepository.releaseSlot(
            branchId,
            date,
            time,
            type
        );
    }
}

export const capacitySlotService =
    new CapacitySlotService();
