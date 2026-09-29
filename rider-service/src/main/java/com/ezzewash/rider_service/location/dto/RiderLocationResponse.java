package com.ezzewash.rider_service.location.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RiderLocationResponse(
        UUID riderId,
        Double latitude,
        Double longitude,
        LocalDateTime updatedAt
) {
}