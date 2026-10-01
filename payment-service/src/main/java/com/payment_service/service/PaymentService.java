package com.payment_service.service;

import com.payment_service.client.AuthClient;
import com.payment_service.client.OrderClient;
import com.payment_service.client.dto.OrderPaymentInfoResponse;
import com.payment_service.client.dto.UserInfoResponse;
import com.payment_service.config.SecurityUser;
import com.payment_service.dto.request.CreatePaymentRequest;
import com.payment_service.dto.request.MarkPaymentFailedRequest;
import com.payment_service.dto.request.MarkPaymentPaidRequest;
import com.payment_service.dto.response.PaymentResponse;
import com.payment_service.entity.Payment;
import com.payment_service.enums.PaymentMethod;
import com.payment_service.enums.PaymentStatus;
import com.payment_service.exception.BadRequestException;
import com.payment_service.exception.ConflictException;
import com.payment_service.exception.ResourceNotFoundException;
import com.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final AuthClient authClient;

    @Transactional
    public PaymentResponse createPayment(
            CreatePaymentRequest request,
            Authentication authentication
    ) {
        SecurityUser securityUser =
                SecurityUser.from(authentication);

        if (
                "USER".equals(securityUser.role())
                        && !securityUser.userId().equals(request.userId())
        ) {
            throw new BadRequestException(
                    "You can only create payment for your own order"
            );
        }

        Jwt jwt =
                (Jwt) authentication.getPrincipal();

        String authorization =
                "Bearer " + jwt.getTokenValue();

        UserInfoResponse user =
                authClient.getUser(
                        request.userId(),
                        authorization
                );

        if (Boolean.FALSE.equals(user.isActive())) {
            throw new ConflictException(
                    "User account is inactive"
            );
        }

        OrderPaymentInfoResponse order =
                orderClient.getOrder(
                        request.orderId(),
                        authorization
                );

        if (!order.userId().equals(request.userId())) {
            throw new BadRequestException(
                    "Order does not belong to this user"
            );
        }

        if (order.totalAmount() == null) {
            throw new BadRequestException(
                    "Order amount is not available"
            );
        }

        if (request.amount().compareTo(order.totalAmount()) != 0) {
            throw new BadRequestException(
                    "Payment amount does not match order amount"
            );
        }

        List<PaymentStatus> activeStatuses =
                List.of(
                        PaymentStatus.PENDING,
                        PaymentStatus.PAID
                );

        if (
                paymentRepository.existsByOrderIdAndStatusIn(
                        request.orderId(),
                        activeStatuses
                )
        ) {
            throw new ConflictException(
                    "Active payment already exists for this order"
            );
        }

        if (
                request.paymentMethod() == PaymentMethod.COD
                        && !isCodAllowed(order.status())
        ) {
            throw new ConflictException(
                    "COD payment is not allowed for this order"
            );
        }

        Payment payment =
                Payment.builder()
                        .orderId(request.orderId())
                        .userId(request.userId())
                        .amount(request.amount())
                        .currency(
                                request.currency() == null
                                        || request.currency().isBlank()
                                        ? "BDT"
                                        : request.currency()
                        )
                        .paymentMethod(request.paymentMethod())
                        .status(PaymentStatus.PENDING)
                        .build();

        return toResponse(
                paymentRepository.save(payment)
        );
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(
            UUID paymentId,
            SecurityUser securityUser
    ) {
        Payment payment =
                getPaymentEntity(paymentId);

        validateAccess(
                payment,
                securityUser
        );

        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrder(
            String orderId,
            SecurityUser securityUser
    ) {
        List<Payment> payments =
                paymentRepository.findByOrderId(orderId);

        if (
                "USER".equals(securityUser.role())
                        && payments.stream()
                        .anyMatch(
                                payment ->
                                        !payment.getUserId()
                                                .equals(securityUser.userId())
                        )
        ) {
            throw new ConflictException(
                    "You cannot access another user's payments"
            );
        }

        return payments
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByUser(
            String userId,
            SecurityUser securityUser
    ) {
        if (
                "USER".equals(securityUser.role())
                        && !securityUser.userId().equals(userId)
        ) {
            throw new ConflictException(
                    "You cannot access another user's payments"
            );
        }

        return paymentRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PaymentResponse markAsPaid(
            UUID paymentId,
            MarkPaymentPaidRequest request
    ) {
        Payment payment =
                getPaymentEntity(paymentId);

        validatePaymentCanBePaid(payment);

        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(
                request.transactionId()
        );
        payment.setPaidAt(
                LocalDateTime.now()
        );

        return toResponse(
                paymentRepository.save(payment)
        );
    }

    @Transactional
    public PaymentResponse markAsFailed(
            UUID paymentId,
            MarkPaymentFailedRequest request
    ) {
        Payment payment =
                getPaymentEntity(paymentId);

        if (
                payment.getStatus()
                        != PaymentStatus.PENDING
        ) {
            throw new ConflictException(
                    "Only pending payments can be marked as failed"
            );
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(
                request.failureReason()
        );
        payment.setFailedAt(
                LocalDateTime.now()
        );

        return toResponse(
                paymentRepository.save(payment)
        );
    }

    @Transactional
    public PaymentResponse cancelPayment(
            UUID paymentId
    ) {
        Payment payment =
                getPaymentEntity(paymentId);

        if (
                payment.getStatus()
                        != PaymentStatus.PENDING
                        && payment.getStatus()
                        != PaymentStatus.FAILED
        ) {
            throw new ConflictException(
                    "Payment cannot be cancelled in its current status"
            );
        }

        payment.setStatus(
                PaymentStatus.CANCELLED
        );

        return toResponse(
                paymentRepository.save(payment)
        );
    }

    private Payment getPaymentEntity(
            UUID paymentId
    ) {
        return paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found"
                        )
                );
    }

    private void validateAccess(
            Payment payment,
            SecurityUser securityUser
    ) {
        if (
                "USER".equals(securityUser.role())
                        && !payment.getUserId()
                        .equals(securityUser.userId())
        ) {
            throw new ConflictException(
                    "You cannot access another user's payment"
            );
        }
    }

    private void validatePaymentCanBePaid(
            Payment payment
    ) {
        if (
                payment.getStatus()
                        != PaymentStatus.PENDING
        ) {
            throw new ConflictException(
                    "Only pending payments can be marked as paid"
            );
        }
    }

    private boolean isCodAllowed(
            String orderStatus
    ) {
        return orderStatus != null
                && !orderStatus.equals("CANCELLED")
                && !orderStatus.equals("DELIVERED");
    }

    private PaymentResponse toResponse(
            Payment payment
    ) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getTransactionId(),
                payment.getPaidAt(),
                payment.getFailedAt(),
                payment.getFailureReason(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
