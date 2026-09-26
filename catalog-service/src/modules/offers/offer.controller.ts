import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { OfferService } from "./offer.service.js";

import {
    createOfferSchema,
    updateOfferSchema,
    updateOfferStatusSchema,
} from "./validation/offer.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";
import { OfferAssignmentService } from "./offer-assignment.service.js";
import { assignUsersToOfferSchema } from "./validation/offer-assignment.schema.js";

export type OfferParams = {
    offerId: string;
};

export type BranchParams = {
    branchId: string;
};

export class OfferController {
    private readonly offerService =
        new OfferService();
    private readonly offerAssignmentService =
        new OfferAssignmentService();


    async createOffer(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message:
                        "Authentication required",
                });

                return;
            }

            const data =
                createOfferSchema.parse(
                    req.body
                );

            const offer =
                await this.offerService.createOffer(
                    data,
                    req.user
                );

            sendSuccess(
                res,
                201,
                { offer },
                "Offer created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getOffer(
        req: Request<OfferParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const offer =
                await this.offerService.getOffer(
                    req.params.offerId
                );

            sendSuccess(
                res,
                200,
                { offer }
            );
        } catch (error) {
            next(error);
        }
    }

    async getOffersByBranch(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const isActive =
                req.query.isActive === undefined
                    ? undefined
                    : req.query.isActive === "true";

            const pagination =
                getPagination(req);

            const result =
                await this.offerService.getOffersByBranch(
                    req.params.branchId,
                    isActive,
                    pagination
                );

            sendSuccess(
                res,
                200,
                {
                    offers:
                        result.offers,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async getActiveOffers(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const offers =
                await this.offerService.getActiveOffers(
                    req.params.branchId
                );

            sendSuccess(
                res,
                200,
                { offers }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateOffer(
        req: Request<OfferParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message:
                        "Authentication required",
                });

                return;
            }

            const data =
                updateOfferSchema.parse(
                    req.body
                );

            const offer =
                await this.offerService.updateOffer(
                    req.params.offerId,
                    data,
                    req.user
                );

            sendSuccess(
                res,
                200,
                { offer },
                "Offer updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async updateOfferStatus(
        req: Request<OfferParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message:
                        "Authentication required",
                });

                return;
            }

            const data =
                updateOfferStatusSchema.parse(
                    req.body
                );

            const offer =
                await this.offerService
                    .updateOfferStatus(
                        req.params.offerId,
                        data.isActive,
                        req.user
                    );

            sendSuccess(
                res,
                200,
                { offer },
                "Offer status updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteOffer(
        req: Request<OfferParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message:
                        "Authentication required",
                });

                return;
            }

            await this.offerService.deleteOffer(
                req.params.offerId,
                req.user
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Offer deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
    async assignUsersToOffer(
        req: Request<OfferParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message:
                        "Authentication required",
                });

                return;
            }

            const data =
                assignUsersToOfferSchema.parse(
                    req.body
                );

            await this.offerAssignmentService.assignUsersToOffer(
                req.params.offerId,
                data,
                req.user
            );

            sendSuccess(
                res,
                201,
                undefined,
                "Users assigned to offer successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
