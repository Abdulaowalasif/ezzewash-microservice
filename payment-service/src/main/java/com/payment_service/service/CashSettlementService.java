package com.payment_service.service;

import com.payment_service.client.RiderClient;
import com.payment_service.dto.request.CreateCashSettlementRequest;
import com.payment_service.dto.response.CashSettlementResponse;
import com.payment_service.entity.CashSettlement;
import com.payment_service.entity.Payment;
import com.payment_service.enums.PaymentMethod;
import com.payment_service.enums.PaymentStatus;
import com.payment_service.enums.SettlementStatus;
import com.payment_service.exception.BadRequestException;
import com.payment_service.exception.ConflictException;
import com.payment_service.exception.ResourceNotFoundException;
import com.payment_service.exception.ServiceUnavailableException;
import com.payment_service.repository.CashSettlementRepository;
import com.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashSettlementService {

    private final CashSettlementRepository cashSettlementRepository;
    private final PaymentRepository paymentRepository;
    private final RiderClient riderClient;

    @Transactional
    public CashSettlementResponse createSettlement(
            CreateCashSettlementRequest request
    ) {
        UUID paymentId;

        try {
            paymentId = UUID.fromString(request.paymentId());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Invalid payment ID"
            );
        }

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );

        if (payment.getPaymentMethod() != PaymentMethod.COD) {
            throw new ConflictException(
                    "Cash settlement is only allowed for COD payments"
            );
        }

        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new ConflictException(
                    "Only paid COD payments can be settled"
            );
        }

        try {
            riderClient.getRider(request.riderId());
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResourceNotFoundException(
                    "Rider not found"
            );
        } catch (ResourceAccessException exception) {
            throw new ServiceUnavailableException(
                    "Rider service is unavailable"
            );
        }

        if (
                cashSettlementRepository.existsByPaymentIdAndStatus(
                        paymentId,
                        SettlementStatus.SETTLED
                )
        ) {
            throw new ConflictException(
                    "Payment has already been settled"
            );
        }

        CashSettlement settlement =
                CashSettlement.builder()
                        .paymentId(payment.getId())
                        .orderId(payment.getOrderId())
                        .riderId(request.riderId())
                        .amount(payment.getAmount())
                        .status(SettlementStatus.PENDING)
                        .build();

        return toResponse(
                cashSettlementRepository.save(settlement)
        );
    }

    @Transactional(readOnly = true)
    public CashSettlementResponse getSettlement(
            UUID settlementId
    ) {
        CashSettlement settlement =
                cashSettlementRepository
                        .findById(settlementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cash settlement not found"
                                )
                        );

        return toResponse(settlement);
    }

    @Transactional(readOnly = true)
    public List<CashSettlementResponse> getSettlementsByRider(
            String riderId
    ) {
        return cashSettlementRepository
                .findByRiderId(riderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CashSettlementResponse completeSettlement(
            UUID settlementId
    ) {
        CashSettlement settlement =
                cashSettlementRepository
                        .findById(settlementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cash settlement not found"
                                )
                        );

        if (
                settlement.getStatus()
                        != SettlementStatus.PENDING
        ) {
            throw new ConflictException(
                    "Only pending settlements can be completed"
            );
        }

        settlement.setStatus(
                SettlementStatus.SETTLED
        );

        settlement.setSettledAt(
                LocalDateTime.now()
        );

        return toResponse(
                cashSettlementRepository.save(settlement)
        );
    }

    private CashSettlementResponse toResponse(
            CashSettlement settlement
    ) {
        return new CashSettlementResponse(
                settlement.getId(),
                settlement.getPaymentId(),
                settlement.getOrderId(),
                settlement.getRiderId(),
                settlement.getAmount(),
                settlement.getStatus(),
                settlement.getSettledAt(),
                settlement.getCreatedAt(),
                settlement.getUpdatedAt()
        );
    }
}