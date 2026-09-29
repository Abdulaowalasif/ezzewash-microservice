package com.ezzewash.rider_service.rider.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRiderOnlineStatusRequest(
        @NotNull(message = "Online status is required")
        Boolean online
) {
}