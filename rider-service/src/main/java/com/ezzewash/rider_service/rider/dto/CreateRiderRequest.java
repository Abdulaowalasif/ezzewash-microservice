package com.ezzewash.rider_service.rider.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRiderRequest(

        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "Branch ID is required")
        String branchId

) {
}