package com.payment_service.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

public record SecurityUser(
        String userId,
        String role
) {

    public static SecurityUser from(
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId =
                jwt.getClaimAsString("userId");

        String role =
                jwt.getClaimAsString("role");

        return new SecurityUser(
                userId,
                role
        );
    }
}