package com.ezzewash.rider_service.catalog.dto;

import java.util.List;

public record CatalogDataResponse(
        List<BranchMembershipResponse> memberships
) {
}