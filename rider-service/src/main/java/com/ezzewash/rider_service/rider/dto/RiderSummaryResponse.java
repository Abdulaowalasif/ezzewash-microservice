    package com.ezzewash.rider_service.rider.dto;

    import java.math.BigDecimal;
    import java.util.UUID;

    public record RiderSummaryResponse(
            UUID id,
            String userId,
            String branchId,
            boolean active,
            boolean online,
            BigDecimal rating,
            int totalDeliveries,
            BigDecimal totalEarnings,
            BigDecimal cashInHand,
            String firstName,
            String lastName,
            String phone,
            String profilePicture,
            String vehicleType,
            String vehicleNumber
    ) {
    }