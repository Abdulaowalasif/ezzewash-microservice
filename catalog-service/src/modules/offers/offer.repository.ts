import { Types } from "mongoose";

import {
    OfferModel,
    type IOffer,
} from "./offer.model.js";

export interface FindOffersOptions {
    branchId: string;
    isActive?: boolean;
    skip: number;
    limit: number;
}

export class OfferRepository {
    async create(
        data: Partial<IOffer>
    ): Promise<IOffer> {
        return OfferModel.create(data);
    }

    async findById(
        offerId: string
    ): Promise<IOffer | null> {
        return OfferModel.findById(offerId);
    }

    async findByBranch(
        options: FindOffersOptions
    ): Promise<IOffer[]> {
        const filter: {
            branchId: Types.ObjectId;
            isActive?: boolean;
        } = {
            branchId:
                new Types.ObjectId(
                    options.branchId
                ),
        };

        if (
            typeof options.isActive ===
            "boolean"
        ) {
            filter.isActive =
                options.isActive;
        }

        return OfferModel.find(filter)
            .populate("serviceIds")
            .sort({ createdAt: -1 })
            .skip(options.skip)
            .limit(options.limit);
    }

    async countByBranch(
        branchId: string,
        isActive?: boolean
    ): Promise<number> {
        const filter: {
            branchId: Types.ObjectId;
            isActive?: boolean;
        } = {
            branchId:
                new Types.ObjectId(
                    branchId
                ),
        };

        if (
            typeof isActive ===
            "boolean"
        ) {
            filter.isActive =
                isActive;
        }

        return OfferModel.countDocuments(
            filter
        );
    }

    async findActiveForBranch(
        branchId: string,
        now: Date = new Date()
    ): Promise<IOffer[]> {
        return OfferModel.find({
            branchId:
                new Types.ObjectId(
                    branchId
                ),

            isActive: true,

            startAt: {
                $lte: now,
            },

            endAt: {
                $gte: now,
            },
        })
            .populate("serviceIds")
            .sort({ startAt: 1 });
    }

    async updateById(
        offerId: string,
        data: Partial<IOffer>
    ): Promise<IOffer | null> {
        return OfferModel.findByIdAndUpdate(
            offerId,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteById(
        offerId: string
    ): Promise<IOffer | null> {
        return OfferModel.findByIdAndDelete(
            offerId
        );
    }
}
