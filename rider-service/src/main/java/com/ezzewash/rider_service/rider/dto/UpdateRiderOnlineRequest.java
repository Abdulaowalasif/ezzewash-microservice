package com.ezzewash.rider_service.rider.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRiderOnlineRequest(

        @NotNull(message = "Online status is required")
        Boolean online

) {
}