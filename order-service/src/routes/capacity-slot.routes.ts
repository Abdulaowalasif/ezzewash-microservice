import { Router } from "express";

import {
    capacitySlotController,
} from "../controllers/capacity-slot.controller.js";

import {
    authenticate,
    requireRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    requireRoles(
        "ADMIN",
    ),
    (req, res, next) => {
        void capacitySlotController.createSlot(
            req,
            res,
            next
        );
    }
);

router.get(
    "/available",
    (req, res, next) => {
        void capacitySlotController
            .getAvailableSlots(
                req,
                res,
                next
            );
    }
);

export default router;
