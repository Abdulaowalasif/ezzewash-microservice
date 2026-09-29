import { Router } from "express";

import {
    internalOrderController,
} from "../controllers/internal-order.controller.js";

const router = Router();


router.get(
    "/orders/:orderId",
    (req, res, next) => {
        void internalOrderController.getOrder(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/orders/:orderId/status",
    (req, res, next) => {
        void internalOrderController.updateOrderStatus(
            req,
            res,
            next
        );
    }
);

export default router;