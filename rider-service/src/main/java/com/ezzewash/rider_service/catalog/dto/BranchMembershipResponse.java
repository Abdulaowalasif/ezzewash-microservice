package com.ezzewash.rider_service.catalog.dto;

public record BranchMembershipResponse(
        String userId,
        BranchResponse branchId,
        boolean isActive
) {
}