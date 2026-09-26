import { Router } from "express";

import { ItemController } from "./item.controller.js";

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
    (req, res, next) => {
        void itemController.createItem(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/:itemId",
    (req, res, next) => {
        void itemController.updateItem(
            req,
            res,
            next
        );
    }
);

router.patch(
    "/:itemId/status",
    (req, res, next) => {
        void itemController.updateItemStatus(
            req,
            res,
            next
        );
    }
);

router.delete(
    "/:itemId",
    (req, res, next) => {
        void itemController.deleteItem(
            req,
            res,
            next
        );
    }
);

export default router;