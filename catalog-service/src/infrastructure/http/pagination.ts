import type { Request } from "express";

export interface Pagination {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function getPagination(
    req: Request
): Pagination {
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page =
        Number.isInteger(rawPage) &&
            rawPage >= 1
            ? rawPage
            : 1;

    const limit =
        Number.isInteger(rawLimit) &&
            rawLimit >= 1 &&
            rawLimit <= 100
            ? rawLimit
            : 20;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
}

export function getPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages:
            Math.ceil(total / limit),
    };
}