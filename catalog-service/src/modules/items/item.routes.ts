import { Router } from "express";

import { ItemController, type ItemParams } from "./item.controller.js";
import { authenticate } from "../../infrastructure/http/auth.middleware.js";

const router = Router();

const itemController =
    new ItemController();

router.get(
    "/",
    (req, res, next) => {
        void itemController.getItems(
            req,
            res,
            next
        );
    }
);

router.get(
    "/:itemId",
    (req, res, next) => {
        void itemController.getItem(
            req,
            res,
            next
        );
    }
);

router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void itemController.createItem(
            req,
            res,
            next
        );
    }
);

router.patch<ItemParams>(
    "/:itemId",
    authenticate,
    (req, res, next) => {
        void itemController.updateItem(
            req,
            res,
            next
        );
    }
);

router.patch<ItemParams>(
    "/:itemId/status",
    authenticate,
    (req, res, next) => {
        void itemController.updateItemStatus(
            req,
            res,
            next
        );
    }
);

router.delete<ItemParams>(
    "/:itemId",
    authenticate,
    (req, res, next) => {
        void itemController.deleteItem(
            req,
            res,
            next
        );
    }
);

export default router;