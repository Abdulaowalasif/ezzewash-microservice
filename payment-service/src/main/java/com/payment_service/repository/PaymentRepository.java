package com.payment_service.repository;

import com.payment_service.entity.Payment;
import com.payment_service.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByOrderId(String orderId);

    List<Payment> findByUserId(String userId);

    Optional<Payment> findFirstByOrderIdAndStatusIn(
            String orderId,
            List<PaymentStatus> statuses
    );

    boolean existsByOrderIdAndStatusIn(
            String orderId,
            List<PaymentStatus> statuses
    );
}