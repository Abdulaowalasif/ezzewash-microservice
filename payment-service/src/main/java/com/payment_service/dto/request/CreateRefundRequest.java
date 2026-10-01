package com.payment_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateRefundRequest(

        @NotBlank
        String reason
) {
}