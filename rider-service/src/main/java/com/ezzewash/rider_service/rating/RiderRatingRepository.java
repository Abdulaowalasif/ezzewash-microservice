package com.ezzewash.rider_service.rating;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RiderRatingRepository
        extends JpaRepository<RiderRating, UUID> {

    List<RiderRating> findByRiderId(
            UUID riderId
    );

    boolean existsByOrderId(
            String orderId
    );
}