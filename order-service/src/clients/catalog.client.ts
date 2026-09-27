import { env } from "../config/config.js";

import type {
    CatalogBranch,
    CatalogBranchMembership,
    CatalogItem,
    CatalogService,
    CatalogServiceItem,
} from "./catalog.types.js";

interface CatalogResponse<T> {
    success: boolean;
    data: T;
}

export class CatalogClient {
    private readonly baseUrl =
        env.catalogServiceUrl;

    private async request<T>(
        path: string
    ): Promise<T> {
        const response =
            await fetch(
                `${this.baseUrl}${path}`
            );

        if (!response.ok) {
            throw new Error(
                `Catalog service request failed with status ${response.status}`
            );
        }

        const body =
            (await response.json()) as CatalogResponse<T>;

        if (!body.success) {
            throw new Error(
                "Catalog service request failed"
            );
        }

        return body.data;
    }

    async getService(
        serviceId: string
    ): Promise<CatalogService> {
        const data =
            await this.request<{
                service: CatalogService;
            }>(
                `/api/v1/services/${serviceId}`
            );

        return data.service;
    }

    async getItem(
        itemId: string
    ): Promise<CatalogItem> {
        const data =
            await this.request<{
                item: CatalogItem;
            }>(
                `/api/v1/items/${itemId}`
            );

        return data.item;
    }

    async getBranch(
        branchId: string
    ): Promise<CatalogBranch> {
        const data =
            await this.request<{
                branch: CatalogBranch;
            }>(
                `/api/v1/branches/${branchId}`
            );

        return data.branch;
    }

    async getServiceItems(
        serviceId: string
    ): Promise<CatalogServiceItem[]> {
        const data =
            await this.request<{
                serviceItems: CatalogServiceItem[];
            }>(
                `/api/v1/service-items/service/${serviceId}`
            );

        return data.serviceItems;
    }


    async getUserMemberships(
        userId: string
    ): Promise<CatalogBranchMembership[]> {
        const data =
            await this.request<{
                memberships: CatalogBranchMembership[];
            }>(
                `/api/v1/branch-memberships/user/${userId}?isActive=true`
            );

        return data.memberships;
    }
}

export const catalogClient =
    new CatalogClient();
