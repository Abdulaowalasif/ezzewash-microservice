package com.ezzewash.rider_service.cash;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RiderCashTransactionRepository
        extends JpaRepository<RiderCashTransaction, UUID> {

    List<RiderCashTransaction> findByRiderId(
            UUID riderId
    );
}