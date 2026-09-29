package com.ezzewash.rider_service.common.response;

import java.time.LocalDateTime;

public record ApiErrorResponse(
        boolean success,
        String message,
        int status,
        LocalDateTime timestamp
) {
}