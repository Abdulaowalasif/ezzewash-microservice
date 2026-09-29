package com.ezzewash.rider_service.cash.dto;

import com.ezzewash.rider_service.cash.CashTransactionType;
import com.ezzewash.rider_service.cash.RiderCashTransaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CashTransactionResponse(
        UUID id,
        UUID riderId,
        CashTransactionType type,
        BigDecimal amount,
        String orderId,
        LocalDateTime createdAt
) {

    public static CashTransactionResponse from(
            RiderCashTransaction transaction
    ) {
        return new CashTransactionResponse(
                transaction.getId(),
                transaction.getRider().getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getOrderId(),
                transaction.getCreatedAt()
        );
    }
}