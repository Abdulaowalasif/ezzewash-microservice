package com.payment_service.dto.response;

import com.payment_service.enums.RefundStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RefundResponse(

        UUID id,

        UUID paymentId,

        String orderId,

        BigDecimal amount,

        String reason,

        RefundStatus status,

        String transactionId,

        LocalDateTime refundedAt,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}