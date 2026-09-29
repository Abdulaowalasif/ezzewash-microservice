package com.ezzewash.rider_service.rating.dto;

import com.ezzewash.rider_service.rating.RiderRating;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RatingResponse(
        UUID id,
        UUID riderId,
        String userId,
        String orderId,
        BigDecimal rating,
        String comment,
        LocalDateTime createdAt
) {

    public static RatingResponse from(
            RiderRating riderRating
    ) {
        return new RatingResponse(
                riderRating.getId(),
                riderRating.getRider().getId(),
                riderRating.getUserId(),
                riderRating.getOrderId(),
                riderRating.getRating(),
                riderRating.getComment(),
                riderRating.getCreatedAt()
        );
    }
}