import { Router } from "express";

import {
    orderController,
} from "../controllers/order.controller.js";

import {
    authenticate,
    requireRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void orderController.createOrder(
            req,
            res,
            next
        );
    }
);

router.get(
    "/",
    authenticate,
    (req, res, next) => {
        void orderController.getUserOrders(
            req,
            res,
            next
        );
    }
);

router.get(
    "/:orderId",
    authenticate,
    (req, res, next) => {
        void orderController.getOrder(
            req,
            res,
            next
        );
    }
);


router.patch(
    "/:orderId/status",
    authenticate,
    requireRoles(
        "RIDER",
        "ADMIN",
        "SUPER_ADMIN"
    ),
    (req, res, next) => {
        void orderController.updateOrderStatus(
            req,
            res,
            next
        );
    }
);


router.patch(
    "/:orderId/rider",
    authenticate,
    requireRoles(
        "ADMIN",
        "SUPER_ADMIN"
    ),
    (req, res, next) => {
        void orderController.assignRider(
            req,
            res,
            next
        );
    }
);

export default router;