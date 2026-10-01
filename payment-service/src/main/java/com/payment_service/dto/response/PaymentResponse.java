package com.payment_service.dto.response;

import com.payment_service.enums.PaymentMethod;
import com.payment_service.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(

        UUID id,

        String orderId,

        String userId,

        BigDecimal amount,

        String currency,

        PaymentMethod paymentMethod,

        PaymentStatus status,

        String transactionId,

        LocalDateTime paidAt,

        LocalDateTime failedAt,

        String failureReason,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}