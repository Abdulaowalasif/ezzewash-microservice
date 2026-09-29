package com.ezzewash.rider_service.settlement;

import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.rider.Rider;
import com.ezzewash.rider_service.rider.RiderRepository;
import com.ezzewash.rider_service.settlement.dto.CreateSettlementRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RiderSettlementService {

    private final RiderSettlementRepository settlementRepository;
    private final RiderRepository riderRepository;

    @Transactional
    public RiderSettlement createSettlement(
            UUID riderId,
            CreateSettlementRequest request
    ) {
        Rider rider = riderRepository
                .findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );

        if (rider.getCashInHand()
                .compareTo(request.amount()) < 0) {
            throw new ConflictException(
                    "Insufficient cash in hand"
            );
        }

        RiderSettlement settlement =
                RiderSettlement.builder()
                        .rider(rider)
                        .amount(request.amount())
                        .status(SettlementStatus.COMPLETED)
                        .settledAt(LocalDateTime.now())
                        .build();

        rider.setCashInHand(
                rider.getCashInHand()
                        .subtract(request.amount())
        );

        riderRepository.save(rider);

        return settlementRepository.save(
                settlement
        );
    }

    public RiderSettlement getSettlement(
            UUID settlementId
    ) {
        return settlementRepository
                .findById(settlementId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Settlement not found"
                        )
                );
    }

    public List<RiderSettlement>
    getRiderSettlements(UUID riderId) {

        if (!riderRepository.existsById(riderId)) {
            throw new ResourceNotFoundException(
                    "Rider not found"
            );
        }

        return settlementRepository
                .findByRiderId(riderId);
    }
}