import {
    Document,
    Model,
    Schema,
    Types,
    model,
} from "mongoose";

export interface IBranchMembership
    extends Document {
    userId: Types.ObjectId;
    branchId: Types.ObjectId;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const branchMembershipSchema =
    new Schema<IBranchMembership>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
            },

            branchId: {
                type: Schema.Types.ObjectId,
                ref: "Branch",
                required: true,
            },

            isActive: {
                type: Boolean,
                default: true,
            },
        },
        {
            timestamps: true,
            versionKey: false,
        }
    );

branchMembershipSchema.index(
    {
        userId: 1,
        branchId: 1,
    },
    {
        unique: true,
    }
);

branchMembershipSchema.index({
    branchId: 1,
    isActive: 1,
});

branchMembershipSchema.index({
    userId: 1,
    isActive: 1,
});

export const BranchMembershipModel:
    Model<IBranchMembership> =
    model<IBranchMembership>(
        "BranchMembership",
        branchMembershipSchema
    );