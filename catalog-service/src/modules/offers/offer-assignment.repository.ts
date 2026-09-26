import {
    Types,
} from "mongoose";

import {
    OfferAssignmentModel,
    type IOfferAssignment,
} from "./offer-assignment.model.js";

export interface CreateOfferAssignmentData {
    offerId: Types.ObjectId;
    userId: Types.ObjectId;
}

export class OfferAssignmentRepository {
    async createMany(
        data: CreateOfferAssignmentData[]
    ): Promise<IOfferAssignment[]> {
        return OfferAssignmentModel.insertMany(
            data,
            {
                ordered: false,
            }
        );
    }

    async findByOffer(
        offerId: string
    ): Promise<IOfferAssignment[]> {
        return OfferAssignmentModel.find({
            offerId:
                new Types.ObjectId(
                    offerId
                ),
        }).sort({
            createdAt: -1,
        });
    }

    async findByUser(
        userId: string
    ): Promise<IOfferAssignment[]> {
        return OfferAssignmentModel.find({
            userId:
                new Types.ObjectId(
                    userId
                ),
        }).sort({
            createdAt: -1,
        });
    }

    async deleteByOffer(
        offerId: string
    ): Promise<void> {
        await OfferAssignmentModel.deleteMany({
            offerId:
                new Types.ObjectId(
                    offerId
                ),
        });
    }
}
