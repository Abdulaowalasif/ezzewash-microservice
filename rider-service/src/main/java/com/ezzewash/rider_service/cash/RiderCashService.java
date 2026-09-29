package com.ezzewash.rider_service.cash;

import com.ezzewash.rider_service.cash.dto.CollectCashRequest;
import com.ezzewash.rider_service.cash.dto.SubmitCashRequest;
import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.rider.Rider;
import com.ezzewash.rider_service.rider.RiderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RiderCashService {

    private final RiderCashTransactionRepository transactionRepository;
    private final RiderRepository riderRepository;

    @Transactional
    public RiderCashTransaction collectCash(
            UUID riderId,
            CollectCashRequest request
    ) {
        Rider rider = getRider(riderId);

        RiderCashTransaction transaction =
                RiderCashTransaction.builder()
                        .rider(rider)
                        .type(CashTransactionType.COLLECTION)
                        .amount(request.amount())
                        .orderId(request.orderId())
                        .build();

        rider.setCashInHand(
                rider.getCashInHand()
                        .add(request.amount())
        );

        riderRepository.save(rider);

        return transactionRepository.save(
                transaction
        );
    }

    @Transactional
    public RiderCashTransaction submitCash(
            UUID riderId,
            SubmitCashRequest request
    ) {
        Rider rider = getRider(riderId);

        if (rider.getCashInHand()
                .compareTo(request.amount()) < 0) {
            throw new ConflictException(
                    "Insufficient cash in hand"
            );
        }

        RiderCashTransaction transaction =
                RiderCashTransaction.builder()
                        .rider(rider)
                        .type(CashTransactionType.SUBMISSION)
                        .amount(request.amount())
                        .build();

        rider.setCashInHand(
                rider.getCashInHand()
                        .subtract(request.amount())
        );

        riderRepository.save(rider);

        return transactionRepository.save(
                transaction
        );
    }

    public List<RiderCashTransaction>
    getTransactions(UUID riderId) {

        getRider(riderId);

        return transactionRepository
                .findByRiderId(riderId);
    }

    private Rider getRider(UUID riderId) {
        return riderRepository
                .findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );
    }
}