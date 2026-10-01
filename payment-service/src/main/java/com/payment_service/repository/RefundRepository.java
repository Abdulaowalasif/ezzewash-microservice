package com.payment_service.repository;

import com.payment_service.entity.Refund;
import com.payment_service.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RefundRepository
        extends JpaRepository<Refund, UUID> {

    List<Refund> findByPaymentId(UUID paymentId);

    List<Refund> findByOrderId(String orderId);

    boolean existsByPaymentIdAndStatus(
            UUID paymentId,
            RefundStatus status
    );
}