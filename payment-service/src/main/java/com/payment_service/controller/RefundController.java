package com.payment_service.controller;

import com.payment_service.dto.request.CreateRefundRequest;
import com.payment_service.dto.response.RefundResponse;
import com.payment_service.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RefundResponse> createRefund(
            @PathVariable UUID paymentId,
            @Valid @RequestBody CreateRefundRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        refundService.createRefund(
                                paymentId,
                                request
                        )
                );
    }

    @GetMapping("/refunds/{refundId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<RefundResponse> getRefund(
            @PathVariable UUID refundId
    ) {
        return ResponseEntity.ok(
                refundService.getRefund(refundId)
        );
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<RefundResponse>> getRefundsByPayment(
            @PathVariable UUID paymentId
    ) {
        return ResponseEntity.ok(
                refundService.getRefundsByPayment(paymentId)
        );
    }

    @GetMapping("/refunds/order/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<RefundResponse>> getRefundsByOrder(
            @PathVariable String orderId
    ) {
        return ResponseEntity.ok(
                refundService.getRefundsByOrder(orderId)
        );
    }

    @PatchMapping("/refunds/{refundId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<RefundResponse> approveRefund(
            @PathVariable UUID refundId
    ) {
        return ResponseEntity.ok(
                refundService.approveRefund(refundId)
        );
    }

    @PatchMapping("/refunds/{refundId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<RefundResponse> rejectRefund(
            @PathVariable UUID refundId,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(
                refundService.rejectRefund(
                        refundId,
                        reason
                )
        );
    }
}