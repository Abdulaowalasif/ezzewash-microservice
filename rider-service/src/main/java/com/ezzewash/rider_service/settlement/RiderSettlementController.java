package com.ezzewash.rider_service.settlement;

import com.ezzewash.rider_service.settlement.dto.CreateSettlementRequest;
import com.ezzewash.rider_service.settlement.dto.SettlementResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/riders/{riderId}/settlements")
@RequiredArgsConstructor
public class RiderSettlementController {

    private final RiderSettlementService settlementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SettlementResponse createSettlement(
            @PathVariable UUID riderId,
            @Valid @RequestBody CreateSettlementRequest request
    ) {
        return SettlementResponse.from(
                settlementService.createSettlement(
                        riderId,
                        request
                )
        );
    }

    @GetMapping("/{settlementId}")
    public SettlementResponse getSettlement(
            @PathVariable UUID riderId,
            @PathVariable UUID settlementId
    ) {
        return SettlementResponse.from(
                settlementService.getSettlement(
                        settlementId
                )
        );
    }

    @GetMapping
    public List<SettlementResponse>
    getRiderSettlements(
            @PathVariable UUID riderId
    ) {
        return settlementService
                .getRiderSettlements(riderId)
                .stream()
                .map(SettlementResponse::from)
                .toList();
    }
}