package com.payment_service.controller;

import com.payment_service.config.ApiResponse;
import com.payment_service.dto.request.CreateCashSettlementRequest;
import com.payment_service.dto.response.CashSettlementResponse;
import com.payment_service.service.CashSettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-settlements")
@RequiredArgsConstructor
public class CashSettlementController {

    private final CashSettlementService cashSettlementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CashSettlementResponse>> createSettlement(
            @Valid @RequestBody CreateCashSettlementRequest request
    ) {
        CashSettlementResponse response =
                cashSettlementService.createSettlement(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Cash settlement created successfully",
                                response
                        )
                );
    }

    @GetMapping("/{settlementId}")
    @PreAuthorize("hasAnyRole('RIDER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CashSettlementResponse>> getSettlement(
            @PathVariable UUID settlementId
    ) {
        CashSettlementResponse response =
                cashSettlementService.getSettlement(
                        settlementId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cash settlement retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/rider/{riderId}")
    @PreAuthorize("hasAnyRole('RIDER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<CashSettlementResponse>>> getSettlementsByRider(
            @PathVariable String riderId
    ) {
        List<CashSettlementResponse> response =
                cashSettlementService.getSettlementsByRider(
                        riderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cash settlements retrieved successfully",
                        response
                )
        );
    }

    @PatchMapping("/{settlementId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CashSettlementResponse>> completeSettlement(
            @PathVariable UUID settlementId
    ) {
        CashSettlementResponse response =
                cashSettlementService.completeSettlement(
                        settlementId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cash settlement completed successfully",
                        response
                )
        );
    }
}