package com.ezzewash.rider_service.auth.dto;

public record AuthUserResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String phone,
        boolean isActive,
        String role,
        String profilePicture
) {
}
