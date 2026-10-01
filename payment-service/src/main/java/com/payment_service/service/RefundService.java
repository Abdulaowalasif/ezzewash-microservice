package com.payment_service.service;

import com.payment_service.dto.request.CreateRefundRequest;
import com.payment_service.dto.response.RefundResponse;
import com.payment_service.entity.Payment;
import com.payment_service.entity.Refund;
import com.payment_service.enums.PaymentStatus;
import com.payment_service.enums.RefundStatus;
import com.payment_service.exception.ConflictException;
import com.payment_service.exception.ResourceNotFoundException;
import com.payment_service.repository.PaymentRepository;
import com.payment_service.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    @Transactional
    public RefundResponse createRefund(
            UUID paymentId,
            CreateRefundRequest request
    ) {
        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );

        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new ConflictException(
                    "Only paid payments can be refunded"
            );
        }

        if (
                refundRepository.existsByPaymentIdAndStatus(
                        paymentId,
                        RefundStatus.PENDING
                )
                        || refundRepository.existsByPaymentIdAndStatus(
                        paymentId,
                        RefundStatus.REFUNDED
                )
        ) {
            throw new ConflictException(
                    "Refund already exists for this payment"
            );
        }

        Refund refund =
                Refund.builder()
                        .paymentId(payment.getId())
                        .orderId(payment.getOrderId())
                        .amount(payment.getAmount())
                        .reason(request.reason())
                        .status(RefundStatus.PENDING)
                        .build();

        return toResponse(
                refundRepository.save(refund)
        );
    }

    @Transactional
    public RefundResponse approveRefund(UUID refundId) {
        Refund refund =
                refundRepository
                        .findById(refundId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Refund not found"
                                )
                        );

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new ConflictException(
                    "Only pending refunds can be approved"
            );
        }

        Payment payment =
                paymentRepository
                        .findById(refund.getPaymentId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );

        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new ConflictException(
                    "Only paid payments can be refunded"
            );
        }

        refund.setStatus(RefundStatus.REFUNDED);
        refund.setTransactionId(
                "REF-" + UUID.randomUUID()
        );
        refund.setRefundedAt(
                LocalDateTime.now()
        );

        payment.setStatus(PaymentStatus.REFUNDED);

        paymentRepository.save(payment);

        return toResponse(
                refundRepository.save(refund)
        );
    }

    @Transactional
    public RefundResponse rejectRefund(
            UUID refundId,
            String reason
    ) {
        Refund refund =
                refundRepository
                        .findById(refundId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Refund not found"
                                )
                        );

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new ConflictException(
                    "Only pending refunds can be rejected"
            );
        }

        refund.setStatus(RefundStatus.REJECTED);
        refund.setReason(reason);

        return toResponse(
                refundRepository.save(refund)
        );
    }

    @Transactional(readOnly = true)
    public RefundResponse getRefund(UUID refundId) {
        Refund refund = refundRepository.findById(refundId).orElseThrow(() -> new ResourceNotFoundException("Refund not found"));

        return toResponse(refund);
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> getRefundsByPayment(
            UUID paymentId
    ) {
        return refundRepository
                .findByPaymentId(paymentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> getRefundsByOrder(
            String orderId
    ) {
        return refundRepository
                .findByOrderId(orderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RefundResponse toResponse(Refund refund) {
        return new RefundResponse(refund.getId(), refund.getPaymentId(), refund.getOrderId(), refund.getAmount(), refund.getReason(), refund.getStatus(), refund.getTransactionId(), refund.getRefundedAt(), refund.getCreatedAt(), refund.getUpdatedAt());
    }
}
