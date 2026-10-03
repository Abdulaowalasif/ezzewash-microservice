package com.notification_service.service;

import com.notification_service.client.AuthServiceClient;
import com.notification_service.dto.request.CreateNotificationRequest;
import com.notification_service.dto.response.NotificationResponse;
import com.notification_service.entity.Notification;
import com.notification_service.enums.NotificationStatus;
import com.notification_service.enums.NotificationType;
import com.notification_service.exception.BadRequestException;
import com.notification_service.exception.ResourceNotFoundException;
import com.notification_service.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final AuthServiceClient authServiceClient;

    public NotificationService(
            NotificationRepository notificationRepository,
            EmailService emailService,
            AuthServiceClient authServiceClient
    ) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.authServiceClient = authServiceClient;
    }

    public NotificationResponse createNotification(
            CreateNotificationRequest request,
            String accessToken
    ) {
        authServiceClient.getUserById(request.userId(), accessToken);

        Notification notification = Notification.builder()
                .userId(request.userId())
                .type(request.type())
                .recipient(request.recipient())
                .subject(request.subject())
                .message(request.message())
                .status(NotificationStatus.PENDING)
                .referenceType(request.referenceType())
                .referenceId(request.referenceId())
                .isRead(false)
                .build();

        return toResponse(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public NotificationResponse getNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));

        return toResponse(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public NotificationResponse sendNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));

        if (notification.getType() != NotificationType.EMAIL) {
            throw new BadRequestException(
                    "Only EMAIL notifications are supported"
            );
        }

        if (notification.getStatus() == NotificationStatus.SENT) {
            throw new BadRequestException(
                    "Notification has already been sent"
            );
        }

        try {
            emailService.sendEmail(
                    notification.getRecipient(),
                    notification.getSubject(),
                    notification.getMessage()
            );

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notification.setFailureReason(null);
            notification.setUpdatedAt(LocalDateTime.now());

        } catch (Exception exception) {

            notification.setStatus(NotificationStatus.FAILED);
            notification.setFailureReason(exception.getMessage());
            notification.setUpdatedAt(LocalDateTime.now());

            notificationRepository.save(notification);

            throw new BadRequestException(
                    "Failed to send notification"
            );
        }

        notificationRepository.save(notification);

        return toResponse(notification);
    }

    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getType(),
                notification.getRecipient(),
                notification.getSubject(),
                notification.getMessage(),
                notification.getStatus(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.getFailureReason(),
                notification.getSentAt(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt(),
                notification.getUpdatedAt()
        );
    }
}
