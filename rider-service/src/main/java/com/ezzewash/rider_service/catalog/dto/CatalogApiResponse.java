package com.ezzewash.rider_service.catalog.dto;

public record CatalogApiResponse(
        boolean success,
        CatalogDataResponse data,
        String requestId
) {
}