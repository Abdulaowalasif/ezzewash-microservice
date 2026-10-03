import { Router } from "express";

import { BranchController, type BranchParams } from "./branch.controller.js";
import { authenticate } from "../../infrastructure/http/auth.middleware.js";
import { requireRoles } from "../../infrastructure/http/role.middleware.js";
import { imageUpload } from "../../infrastructure/upload/multer.js";

const router = Router();

const branchController =
    new BranchController();


router.get("/", (req, res, next) => {
    void branchController.getBranches(req, res, next);
});

router.get<BranchParams>("/:branchId", (req, res, next) => {
    void branchController.getBranch(req, res, next);
});

router.post("/", authenticate, requireRoles("SUPER_ADMIN"), (req, res, next) => {
    void branchController.createBranch(req, res, next);
});

router.patch<BranchParams>("/:branchId", authenticate, requireRoles("SUPER_ADMIN"), (req, res, next) => {
    void branchController.updateBranch(req, res, next);
});

router.patch<BranchParams>("/:branchId/status", authenticate, requireRoles("SUPER_ADMIN"), (req, res, next) => {
    void branchController.updateBranchStatus(req, res, next);
});

router.delete<BranchParams>("/:branchId", authenticate, requireRoles("SUPER_ADMIN"), (req, res, next) => {
    void branchController.deleteBranch(req, res, next);
});

router.post<BranchParams>("/:branchId/image", authenticate, requireRoles("SUPER_ADMIN"), imageUpload.single("image"), (req, res, next) => {
    void branchController.uploadImage(req, res, next);
});

export default router;