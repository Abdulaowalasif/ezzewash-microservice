package com.payment_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateCashSettlementRequest(

        @NotBlank
        String paymentId,

        @NotBlank
        String riderId

) {
}