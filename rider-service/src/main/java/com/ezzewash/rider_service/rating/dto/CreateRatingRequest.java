package com.ezzewash.rider_service.rating.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRatingRequest(

        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "Order ID is required")
        String orderId,

        @NotNull(message = "Rating is required")
        @DecimalMin(
                value = "1.0",
                message = "Rating must be at least 1"
        )
        @DecimalMax(
                value = "5.0",
                message = "Rating must not exceed 5"
        )
        BigDecimal rating,

        String comment

) {
}