package com.ezzewash.rider_service.rider.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRiderStatusRequest(

        @NotNull(message = "Active status is required")
        Boolean active,

        @NotNull(message = "Online status is required")
        Boolean online

) {
}