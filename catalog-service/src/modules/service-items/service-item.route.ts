import { Router } from "express";

import {
    ServiceItemController,
    type ServiceItemParams,
    type ServiceParams,
} from "./service-item.controller.js";

import { authenticate } from "../../infrastructure/http/auth.middleware.js";

const router = Router();

const controller =
    new ServiceItemController();

// Get service items — PUBLIC
router.get(
    "/service/:serviceId",
    (req, res, next) => {
        void controller.getServiceItems(
            req,
            res,
            next
        );
    }
);

// Get one service item — PUBLIC
router.get(
    "/:serviceItemId",
    (req, res, next) => {
        void controller.getServiceItem(
            req,
            res,
            next
        );
    }
);

// Create — AUTHENTICATED
router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void controller.createServiceItem(
            req,
            res,
            next
        );
    }
);

// Update — AUTHENTICATED
router.patch<ServiceItemParams>(
    "/:serviceItemId",
    authenticate,
    (req, res, next) => {
        void controller.updateServiceItem(
            req,
            res,
            next
        );
    }
);

// Delete — AUTHENTICATED
router.delete<ServiceItemParams>(
    "/:serviceItemId",
    authenticate,
    (req, res, next) => {
        void controller.deleteServiceItem(
            req,
            res,
            next
        );
    }
);

export default router;