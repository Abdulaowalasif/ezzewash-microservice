package com.ezzewash.rider_service.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateAssignmentRequest(
        @NotNull(message = "Rider ID is required")
        UUID riderId,

        @NotBlank(message = "Order ID is required")
        String orderId
) {
}
