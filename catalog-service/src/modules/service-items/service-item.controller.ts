import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { ServiceItemService } from "./service-item.service.js";

import {
    createServiceItemSchema,
    updateServiceItemSchema,
} from "./validation/service-item.schema.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

export type ServiceItemParams = {
    serviceItemId: string;
};

export type ServiceParams = {
    serviceId: string;
};

export class ServiceItemController {
    private readonly serviceItemService =
        new ServiceItemService();

    async createServiceItem(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });
                return;
            }

            const data =
                createServiceItemSchema.parse(
                    req.body
                );

            const serviceItem =
                await this.serviceItemService
                    .createServiceItem(
                        data,
                        req.user
                    );

            sendSuccess(
                res,
                201,
                { serviceItem },
                "Service item created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getServiceItem(
        req: Request<ServiceItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const serviceItem =
                await this.serviceItemService.getServiceItem(
                    req.params.serviceItemId
                );

            sendSuccess(
                res,
                200,
                { serviceItem }
            );
        } catch (error) {
            next(error);
        }
    }

    async getServiceItems(
        req: Request<ServiceParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const isActive =
                req.query.isActive === undefined
                    ? undefined
                    : req.query.isActive === "true";

            const serviceItems =
                await this.serviceItemService.getServiceItems(
                    req.params.serviceId,
                    isActive
                );

            sendSuccess(
                res,
                200,
                { serviceItems }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateServiceItem(
        req: Request<ServiceItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });
                return;
            }

            const data =
                updateServiceItemSchema.parse(
                    req.body
                );

            const serviceItem =
                await this.serviceItemService
                    .updateServiceItem(
                        req.params.serviceItemId,
                        data,
                        req.user
                    );

            sendSuccess(
                res,
                200,
                { serviceItem },
                "Service item updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteServiceItem(
        req: Request<ServiceItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Authentication required",
                });
                return;
            }

            await this.serviceItemService
                .deleteServiceItem(
                    req.params.serviceItemId,
                    req.user
                );

            sendSuccess(
                res,
                200,
                undefined,
                "Service item deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
