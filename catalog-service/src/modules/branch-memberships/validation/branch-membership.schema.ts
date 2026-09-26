import { z } from "zod";

export const createBranchMembershipSchema =
    z.object({
        userId: z
            .string()
            .trim()
            .min(1, "User ID is required"),

        branchId: z
            .string()
            .trim()
            .min(1, "Branch ID is required"),

        isActive: z
            .boolean()
            .optional(),
    });

export const updateBranchMembershipSchema =
    z.object({
        isActive: z.boolean(),
    });

export type CreateBranchMembershipInput =
    z.infer<
        typeof createBranchMembershipSchema
    >;

export type UpdateBranchMembershipInput =
    z.infer<
        typeof updateBranchMembershipSchema
    >;