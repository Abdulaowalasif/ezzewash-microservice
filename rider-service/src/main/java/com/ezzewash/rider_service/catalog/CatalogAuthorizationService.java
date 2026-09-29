package com.ezzewash.rider_service.catalog;

import com.ezzewash.rider_service.catalog.dto.BranchMembershipResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CatalogAuthorizationService {

    private final CatalogClient catalogClient;

    public boolean hasActiveBranchMembership(
            String userId,
            String branchId
    ) {
        return catalogClient
                .getUserMemberships(userId)
                .stream()
                .filter(BranchMembershipResponse::isActive)
                .anyMatch(membership ->
                        membership.branchId() != null &&
                                branchId.equals(
                                        membership.branchId()._id()
                                )
                );
    }
}