package com.ezzewash.rider_service.settlement.dto;

import com.ezzewash.rider_service.settlement.RiderSettlement;
import com.ezzewash.rider_service.settlement.SettlementStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SettlementResponse(
        UUID id,
        UUID riderId,
        BigDecimal amount,
        SettlementStatus status,
        LocalDateTime settledAt,
        LocalDateTime createdAt
) {

    public static SettlementResponse from(
            RiderSettlement settlement
    ) {
        return new SettlementResponse(
                settlement.getId(),
                settlement.getRider().getId(),
                settlement.getAmount(),
                settlement.getStatus(),
                settlement.getSettledAt(),
                settlement.getCreatedAt()
        );
    }
}