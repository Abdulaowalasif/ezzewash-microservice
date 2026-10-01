package com.payment_service.client.dto;

public record UserInfoResponse(

        String id,

        String firstName,

        String lastName,

        String email,

        String phone,

        String role,

        Boolean isActive,

        Boolean isEmailVerified

) {
}