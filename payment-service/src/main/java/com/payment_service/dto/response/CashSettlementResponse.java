package com.payment_service.dto.response;

import com.payment_service.enums.SettlementStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CashSettlementResponse(

        UUID id,

        UUID paymentId,

        String orderId,

        String riderId,

        BigDecimal amount,

        SettlementStatus status,

        LocalDateTime settledAt,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}