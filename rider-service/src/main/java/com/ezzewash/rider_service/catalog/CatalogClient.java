package com.ezzewash.rider_service.catalog;

import com.ezzewash.rider_service.catalog.dto.BranchMembershipResponse;
import com.ezzewash.rider_service.catalog.dto.CatalogApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CatalogClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${catalog-service.url}")
    private String catalogServiceUrl;

    public List<BranchMembershipResponse> getUserMemberships(
            String userId
    ) {
        CatalogApiResponse response =
                restClientBuilder
                        .baseUrl(catalogServiceUrl)
                        .build()
                        .get()
                        .uri(
                                "/api/v1/branch-memberships/user/{userId}",
                                userId
                        )
                        .retrieve()
                        .body(CatalogApiResponse.class);

        if (response == null ||
                response.data() == null ||
                response.data().memberships() == null) {
            return List.of();
        }

        return response.data().memberships();
    }
}