import { Router } from "express";

import {
    BranchMembershipController,
} from "./branch-membership.controller.js";

const router = Router();

const controller =
    new BranchMembershipController();

router.get(
    "/user/:userId",
    (req, res, next) => {
        void controller.getUserMemberships(
            req,
            res,
            next
        );
    }
);

router.get(
    "/branch/:branchId",
    (req, res, next) => {
        void controller.getBranchMemberships(
            req,
            res,
            next
        );
    }
);

router.get(
    "/:membershipId",
    (req, res, next) => {
        void controller.getMembership(
            req,
            res,
            next
        );
    }
);

router.post(
    "/",
    (req, res, next) => {
        void controller.createMembership(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/:membershipId",
    (req, res, next) => {
        void controller.updateMembership(
            req,
            res,
            next
        );
    }
);

router.delete(
    "/:membershipId",
    (req, res, next) => {
        void controller.deleteMembership(
            req,
            res,
            next
        );
    }
);

export default router;