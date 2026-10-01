package com.payment_service.controller;

import com.payment_service.config.ApiResponse;
import com.payment_service.config.SecurityUser;
import com.payment_service.dto.request.CreatePaymentRequest;
import com.payment_service.dto.request.MarkPaymentFailedRequest;
import com.payment_service.dto.request.MarkPaymentPaidRequest;
import com.payment_service.dto.response.PaymentResponse;
import com.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        paymentService.createPayment(
                                request,
                                authentication
                        )
                );
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('USER', 'RIDER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable UUID paymentId,
            Authentication authentication
    ) {
        PaymentResponse response =
                paymentService.getPayment(
                        paymentId,
                        SecurityUser.from(authentication)
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'RIDER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrder(
            @PathVariable String orderId,
            Authentication authentication
    ) {
        List<PaymentResponse> response =
                paymentService.getPaymentsByOrder(
                        orderId,
                        SecurityUser.from(authentication)
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payments retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByUser(
            @PathVariable String userId,
            Authentication authentication
    ) {
        List<PaymentResponse> response =
                paymentService.getPaymentsByUser(
                        userId,
                        SecurityUser.from(authentication)
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payments retrieved successfully",
                        response
                )
        );
    }

    @PatchMapping("/{paymentId}/paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> markAsPaid(
            @PathVariable UUID paymentId,
            @Valid @RequestBody MarkPaymentPaidRequest request
    ) {
        PaymentResponse response =
                paymentService.markAsPaid(
                        paymentId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment marked as paid",
                        response
                )
        );
    }

    @PatchMapping("/{paymentId}/failed")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> markAsFailed(
            @PathVariable UUID paymentId,
            @Valid @RequestBody MarkPaymentFailedRequest request
    ) {
        PaymentResponse response =
                paymentService.markAsFailed(
                        paymentId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment marked as failed",
                        response
                )
        );
    }

    @PatchMapping("/{paymentId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(
            @PathVariable UUID paymentId
    ) {
        PaymentResponse response =
                paymentService.cancelPayment(paymentId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment cancelled successfully",
                        response
                )
        );
    }
}