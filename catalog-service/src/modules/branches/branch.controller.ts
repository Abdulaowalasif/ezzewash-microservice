import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { BranchService } from "./branch.service.js";

import {
    createBranchSchema,
    updateBranchSchema,
    updateBranchStatusSchema,
} from "./validation/branch.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";

export type BranchParams = {
    branchId: string;
};

export class BranchController {
    private readonly branchService =
        new BranchService();

    async createBranch(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createBranchSchema.parse(
                    req.body
                );

            const branch =
                await this.branchService.createBranch(
                    data
                );

            sendSuccess(
                res,
                201,
                { branch },
                "Branch created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getBranch(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const branch =
                await this.branchService.getBranch(
                    req.params.branchId
                );

            sendSuccess(
                res,
                200,
                { branch }
            );
        } catch (error) {
            next(error);
        }
    }

    async getBranches(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const isActive =
                req.query.isActive === undefined
                    ? undefined
                    : req.query.isActive === "true";

            const pagination =
                getPagination(req);

            const result =
                await this.branchService.getBranches(
                    isActive,
                    pagination
                );

            sendSuccess(
                res,
                200,
                {
                    branches:
                        result.branches,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateBranch(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateBranchSchema.parse(
                    req.body
                );

            const branch =
                await this.branchService.updateBranch(
                    req.params.branchId,
                    data
                );

            sendSuccess(
                res,
                200,
                { branch },
                "Branch updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async updateBranchStatus(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateBranchStatusSchema.parse(
                    req.body
                );

            const branch =
                await this.branchService.updateBranchStatus(
                    req.params.branchId,
                    data.isActive
                );

            sendSuccess(
                res,
                200,
                { branch },
                "Branch status updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteBranch(
        req: Request<BranchParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.branchService.deleteBranch(
                req.params.branchId
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Branch deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
