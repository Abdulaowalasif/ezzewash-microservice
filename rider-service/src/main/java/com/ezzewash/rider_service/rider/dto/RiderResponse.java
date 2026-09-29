    package com.ezzewash.rider_service.rider.dto;

    import com.ezzewash.rider_service.rider.Rider;

    import java.math.BigDecimal;
    import java.time.LocalDateTime;
    import java.util.UUID;

    public record RiderResponse(
            UUID id,
            String userId,
            String branchId,
            boolean active,
            boolean online,
            BigDecimal rating,
            int totalDeliveries,
            BigDecimal totalEarnings,
            BigDecimal cashInHand,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        public static RiderResponse from(
                Rider rider
        ) {
            return new RiderResponse(
                    rider.getId(),
                    rider.getUserId(),
                    rider.getBranchId(),
                    rider.isActive(),
                    rider.isOnline(),
                    rider.getRating(),
                    rider.getTotalDeliveries(),
                    rider.getTotalEarnings(),
                    rider.getCashInHand(),
                    rider.getCreatedAt(),
                    rider.getUpdatedAt()
            );
        }
    }