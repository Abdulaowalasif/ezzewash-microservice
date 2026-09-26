import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    BranchMembershipService,
} from "./brach-membership.service.js";

import {
    createBranchMembershipSchema,
    updateBranchMembershipSchema,
} from "./validation/branch-membership.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";

type MembershipParams = {
    membershipId: string;
};

type UserParams = {
    userId: string;
};

type BranchParams = {
    branchId: string;
};

export class BranchMembershipController {
    private readonly membershipService =
        new BranchMembershipService();

    async createMembership(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createBranchMembershipSchema.parse(
                    req.body
                );

            const membership =
                await this.membershipService.createMembership(
                    data
                );

            sendSuccess(
                res,
                201,
                { membership },
                "Branch membership created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getMembership(
        req: Request<MembershipParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const membership =
                await this.membershipService.getMembership(
                    req.params.membershipId
                );

            sendSuccess(
                res,
                200,
                { membership }
            );
        } catch (error) {
            next(error);
        }
    }

    async getUserMemberships(
        req: Request<UserParams>,
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
                await this.membershipService
                    .getUserMemberships(
                        req.params.userId,
                        isActive,
                        pagination
                    );

            sendSuccess(
                res,
                200,
                {
                    memberships:
                        result.memberships,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async getBranchMemberships(
        req: Request<BranchParams>,
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
                await this.membershipService
                    .getBranchMemberships(
                        req.params.branchId,
                        isActive,
                        pagination
                    );

            sendSuccess(
                res,
                200,
                {
                    memberships:
                        result.memberships,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateMembership(
        req: Request<MembershipParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateBranchMembershipSchema.parse(
                    req.body
                );

            const membership =
                await this.membershipService
                    .updateMembership(
                        req.params.membershipId,
                        data
                    );

            sendSuccess(
                res,
                200,
                { membership },
                "Branch membership updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteMembership(
        req: Request<MembershipParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.membershipService.deleteMembership(
                req.params.membershipId
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Branch membership deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
