export interface CatalogBranch {
    _id: string;
    name: string;
    isActive: boolean;
}

export interface CatalogService {
    _id: string;
    branchId: string;
    name: string;
    price: number;
    isActive: boolean;
}

export interface CatalogItem {
    _id: string;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
}

export interface CatalogServiceItem {
    _id: string;
    serviceId: string;
    itemId: CatalogItem;
    price: number;
    currency: string;
    isActive: boolean;
}

export interface CatalogBranchMembership {
    userId: string;
    branchId: {
        _id: string;
    };
    isActive: boolean;
}