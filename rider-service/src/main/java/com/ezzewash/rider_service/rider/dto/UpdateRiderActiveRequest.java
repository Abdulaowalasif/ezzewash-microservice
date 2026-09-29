package com.ezzewash.rider_service.rider.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRiderActiveRequest(

        @NotNull(message = "Active status is required")
        Boolean active

) {
}