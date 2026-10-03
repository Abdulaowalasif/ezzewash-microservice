import { Router } from "express";

import {
    ServiceController,
    type ServiceParams,
    type BranchParams,
} from "./service.controller.js";

import { authenticate } from "../../infrastructure/http/auth.middleware.js";
import { imageUpload } from "../../infrastructure/upload/multer.js";

const router = Router();

const serviceController =
    new ServiceController();

// Get services for a branch — PUBLIC
router.get<BranchParams>(
    "/branch/:branchId",
    (req, res, next) => {
        void serviceController.getServicesByBranch(
            req,
            res,
            next
        );
    }
);

// Get one service — PUBLIC
router.get<ServiceParams>(
    "/:serviceId",
    (req, res, next) => {
        void serviceController.getService(
            req,
            res,
            next
        );
    }
);

// Create service — AUTHENTICATED
router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void serviceController.createService(
            req,
            res,
            next
        );
    }
);

// Update service — AUTHENTICATED
router.patch<ServiceParams>(
    "/:serviceId",
    authenticate,
    (req, res, next) => {
        void serviceController.updateService(
            req,
            res,
            next
        );
    }
);

// Activate/deactivate service — AUTHENTICATED
router.patch<ServiceParams>(
    "/:serviceId/status",
    authenticate,
    (req, res, next) => {
        void serviceController.updateServiceStatus(
            req,
            res,
            next
        );
    }
);

// Delete service — AUTHENTICATED
router.delete<ServiceParams>(
    "/:serviceId",
    authenticate,
    (req, res, next) => {
        void serviceController.deleteService(
            req,
            res,
            next
        );
    }
);

// Upload image — AUTHENTICATED
router.post<ServiceParams>(
    "/:serviceId/image",
    authenticate,
    imageUpload.single("image"),
    (req, res, next) => {
        void serviceController.uploadImage(
            req,
            res,
            next
        );
    }
);

export default router;