import { z } from "zod";

export const assignUsersToOfferSchema =
    z.object({
        userIds: z
            .array(
                z.string()
                    .trim()
                    .min(1)
            )
            .min(
                1,
                "At least one user ID is required"
            ),
    });

export type AssignUsersToOfferInput =
    z.infer<
        typeof assignUsersToOfferSchema
    >;
