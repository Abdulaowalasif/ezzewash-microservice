import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { ServiceService } from "./service.service.js";

import {
    createServiceSchema,
    updateServiceSchema,
    updateServiceStatusSchema,
} from "./validation/service.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";

export type ServiceParams = {
    serviceId: string;
};

export type BranchParams = {
    branchId: string;
};

export class ServiceController {
    private readonly serviceService =
        new ServiceService();

    async createService(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createServiceSchema.parse(
                    req.body
                );

            const service =
                await this.serviceService.createService(
                    data,
                    req.user!
                );

            sendSuccess(
                res,
                201,
                { service },
                "Service created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getService(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const service =
                await this.serviceService.getService(
                    req.params.serviceId
                );

            sendSuccess(
                res,
                200,
                { service }
            );
        } catch (error) {
            next(error);
        }
    }

    async getServicesByBranch(
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
                await this.serviceService
                    .getServicesByBranch(
                        req.params.branchId,
                        isActive,
                        pagination
                    );

            sendSuccess(
                res,
                200,
                {
                    services:
                        result.services,

                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateService(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateServiceSchema.parse(
                    req.body
                );

            const service =
                await this.serviceService.updateService(
                    req.params.serviceId,
                    data,
                    req.user!
                );

            sendSuccess(
                res,
                200,
                { service },
                "Service updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async updateServiceStatus(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateServiceStatusSchema.parse(
                    req.body
                );

            const service =
                await this.serviceService.updateServiceStatus(
                    req.params.serviceId,
                    data.isActive,
                    req.user!
                );

            sendSuccess(
                res,
                200,
                { service },
                "Service status updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteService(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await this.serviceService.deleteService(
                req.params.serviceId,
                req.user!
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Service deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
