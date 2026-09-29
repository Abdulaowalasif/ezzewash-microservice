package com.ezzewash.rider_service.location;

import com.ezzewash.rider_service.location.dto.RiderLocationResponse;
import com.ezzewash.rider_service.location.dto.UpdateLocationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/riders/{riderId}/location")
@RequiredArgsConstructor
public class RiderLocationController {

    private final RiderLocationService locationService;

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateLocation(
            @PathVariable UUID riderId,
            @Valid @RequestBody UpdateLocationRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        locationService.updateLocation(
                riderId,
                request,
                jwt.getClaimAsString("userId")
        );
    }

    @GetMapping
    public RiderLocationResponse getLocation(
            @PathVariable UUID riderId
    ) {
        return locationService.getLocation(
                riderId
        );
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLocation(
            @PathVariable UUID riderId
    ) {
        locationService.deleteLocation(
                riderId
        );
    }
}