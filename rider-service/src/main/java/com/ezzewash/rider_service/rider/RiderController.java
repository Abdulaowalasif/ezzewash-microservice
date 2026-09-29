package com.ezzewash.rider_service.rider;

import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.rider.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/riders")
@RequiredArgsConstructor
public class RiderController {

    private final RiderService riderService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RiderResponse createRider(
            @Valid @RequestBody CreateRiderRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return RiderResponse.from(
                riderService.createRider(
                        request,
                        jwt.getClaimAsString("userId")
                )
        );
    }

    @GetMapping
    public List<RiderResponse> getAllRiders() {
        return riderService.getAllRiders()
                .stream()
                .map(RiderResponse::from)
                .toList();
    }

    @GetMapping("/{riderId}")
    public RiderResponse getRider(
            @PathVariable UUID riderId
    ) {
        return RiderResponse.from(
                riderService.getRider(riderId)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{riderId}/active")
    public RiderResponse updateActiveStatus(
            @PathVariable UUID riderId,
            @Valid @RequestBody UpdateRiderActiveRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return RiderResponse.from(
                riderService.updateActiveStatus(
                        riderId,
                        request,
                        jwt.getClaimAsString("userId")
                )
        );
    }

    @PreAuthorize("hasRole('RIDER')")
    @PatchMapping("/{riderId}/online")
    public RiderResponse updateOnlineStatus(
            @PathVariable UUID riderId,
            @Valid @RequestBody UpdateRiderOnlineRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return RiderResponse.from(
                riderService.updateOnlineStatus(
                        riderId,
                        request,
                        jwt.getClaimAsString("userId")
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @GetMapping("/{riderId}/summary")
    public RiderSummaryResponse getRiderSummary(
            @PathVariable UUID riderId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return riderService.getRiderSummary(
                riderId,
                jwt.getClaimAsString("userId"),
                jwt.getClaimAsString("role")
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{riderId}/active-status")
    public Rider updateActiveStatus(
            @PathVariable UUID riderId,
            @Valid @RequestBody UpdateRiderActiveStatusRequest request
    ) {
        return riderService.updateActiveStatus(
                riderId,
                request.active()
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @PatchMapping("/{riderId}/online-status")
    public Rider updateOnlineStatus(
            @PathVariable UUID riderId,
            @Valid @RequestBody UpdateRiderOnlineStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return riderService.updateOnlineStatus(
                riderId,
                request.online(),
                jwt.getClaimAsString("userId"),
                jwt.getClaimAsString("role")
        );
    }

    @GetMapping("/user/{userId}")
    public RiderResponse getRiderByUserId(
            @PathVariable String userId
    ) {
        return RiderResponse.from(
                riderService.getRiderByUserId(userId)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/available")
    public List<RiderResponse> getAvailableRiders() {
        return riderService
                .getAvailableRiders()
                .stream()
                .map(RiderResponse::from)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/available/branch/{branchId}")
    public List<RiderResponse> getAvailableRidersByBranch(
            @PathVariable String branchId
    ) {
        return riderService
                .getAvailableRidersByBranch(branchId)
                .stream()
                .map(RiderResponse::from)
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RIDER')")
    public RiderResponse getCurrentRider(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return RiderResponse.from(
                riderService.getRiderByUserId(
                        jwt.getClaimAsString("userId")
                )
        );
    }

    @PreAuthorize("hasRole('RIDER')")
    @GetMapping("/dashboard")
    public RiderDashboardResponse getRiderDashboard(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return riderService.getRiderDashboard(
                jwt.getClaimAsString("userId")
        );
    }
}