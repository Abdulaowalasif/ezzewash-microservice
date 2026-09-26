import { Router } from "express";

import { authenticate } from "../../infrastructure/http/auth.middleware.js";

import {
    OfferController,
    type BranchParams,
    type OfferParams,
} from "./offer.controller.js";

const router = Router();

const controller =
    new OfferController();

// ===============================
// Public routes
// ===============================

router.get<BranchParams>(
    "/branch/:branchId/active",
    (req, res, next) => {
        void controller.getActiveOffers(
            req,
            res,
            next
        );
    }
);

router.get<BranchParams>(
    "/branch/:branchId",
    (req, res, next) => {
        void controller.getOffersByBranch(
            req,
            res,
            next
        );
    }
);

router.get<OfferParams>(
    "/:offerId",
    (req, res, next) => {
        void controller.getOffer(
            req,
            res,
            next
        );
    }
);

// ===============================
// Protected management routes
// ===============================

router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void controller.createOffer(
            req,
            res,
            next
        );
    }
);

router.patch<OfferParams>(
    "/:offerId",
    authenticate,
    (req, res, next) => {
        void controller.updateOffer(
            req,
            res,
            next
        );
    }
);

router.patch<OfferParams>(
    "/:offerId/status",
    authenticate,
    (req, res, next) => {
        void controller.updateOfferStatus(
            req,
            res,
            next
        );
    }
);

router.delete<OfferParams>(
    "/:offerId",
    authenticate,
    (req, res, next) => {
        void controller.deleteOffer(
            req,
            res,
            next
        );
    }
);

router.post<OfferParams>(
    "/:offerId/assign-users",
    authenticate,
    (req, res, next) => {
        void controller.assignUsersToOffer(
            req,
            res,
            next
        );
    }
);


export default router;