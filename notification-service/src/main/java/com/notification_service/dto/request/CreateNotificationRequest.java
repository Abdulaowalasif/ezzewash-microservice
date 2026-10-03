package com.notification_service.dto.request;

import com.notification_service.enums.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(

        @NotBlank(message = "User ID is required")
        String userId,

        @NotNull(message = "Notification type is required")
        NotificationType type,

        @NotBlank(message = "Recipient is required")
        @Email(message = "Recipient must be a valid email address")
        String recipient,

        @NotBlank(message = "Subject is required")
        String subject,

        @NotBlank(message = "Message is required")
        String message,

        String referenceType,

        String referenceId
) {
}