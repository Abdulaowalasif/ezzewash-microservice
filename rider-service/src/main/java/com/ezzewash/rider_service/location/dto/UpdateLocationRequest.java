package com.ezzewash.rider_service.location.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdateLocationRequest(

        @NotNull(message = "Latitude is required")
        @DecimalMin(
                value = "-90.0",
                message = "Invalid latitude"
        )
        @DecimalMax(
                value = "90.0",
                message = "Invalid latitude"
        )
        Double latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(
                value = "-180.0",
                message = "Invalid longitude"
        )
        @DecimalMax(
                value = "180.0",
                message = "Invalid longitude"
        )
        Double longitude

) {
}