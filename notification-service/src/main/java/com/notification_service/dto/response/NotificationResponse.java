package com.notification_service.dto.response;

import com.notification_service.enums.NotificationStatus;
import com.notification_service.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String userId,
        NotificationType type,
        String recipient,
        String subject,
        String message,
        NotificationStatus status,
        String referenceType,
        String referenceId,
        String failureReason,
        LocalDateTime sentAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}