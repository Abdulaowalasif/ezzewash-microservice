package com.payment_service.repository;

import com.payment_service.entity.CashSettlement;
import com.payment_service.enums.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CashSettlementRepository
        extends JpaRepository<CashSettlement, UUID> {

    List<CashSettlement> findByRiderId(String riderId);

    List<CashSettlement> findByOrderId(String orderId);

    Optional<CashSettlement> findByPaymentId(UUID paymentId);

    boolean existsByPaymentIdAndStatus(
            UUID paymentId,
            SettlementStatus status
    );
}