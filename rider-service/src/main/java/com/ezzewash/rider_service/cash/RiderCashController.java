package com.ezzewash.rider_service.cash;

import com.ezzewash.rider_service.cash.dto.CashTransactionResponse;
import com.ezzewash.rider_service.cash.dto.CollectCashRequest;
import com.ezzewash.rider_service.cash.dto.SubmitCashRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/riders/{riderId}/cash")
@RequiredArgsConstructor
public class RiderCashController {

    private final RiderCashService cashService;

    @PostMapping("/collect")
    @ResponseStatus(HttpStatus.CREATED)
    public CashTransactionResponse collectCash(
            @PathVariable UUID riderId,
            @Valid @RequestBody CollectCashRequest request
    ) {
        return CashTransactionResponse.from(
                cashService.collectCash(
                        riderId,
                        request
                )
        );
    }

    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public CashTransactionResponse submitCash(
            @PathVariable UUID riderId,
            @Valid @RequestBody SubmitCashRequest request
    ) {
        return CashTransactionResponse.from(
                cashService.submitCash(
                        riderId,
                        request
                )
        );
    }

    @GetMapping
    public List<CashTransactionResponse>
    getTransactions(
            @PathVariable UUID riderId
    ) {
        return cashService
                .getTransactions(riderId)
                .stream()
                .map(CashTransactionResponse::from)
                .toList();
    }
}