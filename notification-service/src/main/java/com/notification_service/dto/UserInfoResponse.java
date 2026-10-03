package com.notification_service.dto;

public record UserInfoResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role,
        boolean isActive
) {
}