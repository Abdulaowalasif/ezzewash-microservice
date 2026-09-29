package com.ezzewash.rider_service.settlement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RiderSettlementRepository
        extends JpaRepository<RiderSettlement, UUID> {

    List<RiderSettlement> findByRiderId(
            UUID riderId
    );
}