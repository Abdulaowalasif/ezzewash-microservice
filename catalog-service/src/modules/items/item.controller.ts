import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { ItemService } from "./item.service.js";

import {
    createItemSchema,
    updateItemSchema,
    updateItemStatusSchema,
} from "./validation/item.schema.js";

import {
    getPagination,
} from "../../infrastructure/http/pagination.js";

import { validateImageFile } from "../../infrastructure/upload/validate-image.js";

import {
    sendSuccess,
} from "../../infrastructure/http/api-response.js";

export type ItemParams = {
    itemId: string;
};

export class ItemController {
    private readonly itemService =
        new ItemService();

    async createItem(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                createItemSchema.parse(req.body);

            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                    requestId:
                        res.locals.requestId,
                });

                return;
            }

            const item =
                await this.itemService.createItem(
                    data,
                    req.user
                );

            sendSuccess(
                res,
                201,
                { item },
                "Item created successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async getItem(
        req: Request<ItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const item =
                await this.itemService.getItem(
                    req.params.itemId
                );

            sendSuccess(
                res,
                200,
                { item }
            );
        } catch (error) {
            next(error);
        }
    }

    async getItems(
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
                await this.itemService.getItems(
                    isActive,
                    pagination
                );

            sendSuccess(
                res,
                200,
                {
                    items: result.items,
                    pagination:
                        result.pagination,
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async updateItem(
        req: Request<ItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateItemSchema.parse(req.body);

            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                    requestId:
                        res.locals.requestId,
                });

                return;
            }

            const item =
                await this.itemService.updateItem(
                    req.params.itemId,
                    data,
                    req.user
                );

            sendSuccess(
                res,
                200,
                { item },
                "Item updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async updateItemStatus(
        req: Request<ItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data =
                updateItemStatusSchema.parse(
                    req.body
                );

            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                    requestId:
                        res.locals.requestId,
                });

                return;
            }

            const item =
                await this.itemService.updateItemStatus(
                    req.params.itemId,
                    data.isActive,
                    req.user
                );

            sendSuccess(
                res,
                200,
                { item },
                "Item status updated successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteItem(
        req: Request<ItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication required",
                    requestId:
                        res.locals.requestId,
                });

                return;
            }

            await this.itemService.deleteItem(
                req.params.itemId,
                req.user
            );

            sendSuccess(
                res,
                200,
                undefined,
                "Item deleted successfully"
            );
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(
        req: Request<ItemParams>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    message: "Image file is required",
                });
                return;
            }

            const isValidImage = await validateImageFile(
                req.file.path
            );

            if (!isValidImage) {
                res.status(400).json({
                    message: "Invalid image file format",
                });
                return;
            }

            const imageUrl =
                `${req.protocol}://${req.get("host")}/uploads/catalog/${req.file.filename}`;

            const item = await this.itemService.updateItem(
                req.params.itemId,
                { imageUrl },
                req.user!
            );

            sendSuccess(
                res,
                200,
                { item },
                "Item image uploaded successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}
