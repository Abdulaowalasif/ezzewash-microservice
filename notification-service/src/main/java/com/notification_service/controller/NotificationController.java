package com.notification_service.controller;

import com.notification_service.dto.request.CreateNotificationRequest;
import com.notification_service.dto.response.NotificationResponse;
import com.notification_service.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request,
            Authentication authentication
    ) {
        String authenticatedUserId = getAuthenticatedUserId(authentication);
        String accessToken = getAccessToken(authentication);

        if (!isAdmin(authentication) && !authenticatedUserId.equals(request.userId())) {
            throw new AccessDeniedException("You can only create notifications for yourself");
        }

        NotificationResponse response =
                notificationService.createNotification(request, accessToken);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotification(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        NotificationResponse response = notificationService.getNotification(notificationId);

        if (!isAdmin(authentication)) {
            String authenticatedUserId = getAuthenticatedUserId(authentication);

            if (!authenticatedUserId.equals(response.userId())) {
                throw new AccessDeniedException("You cannot access this notification");
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable String userId,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            String authenticatedUserId = getAuthenticatedUserId(authentication);

            if (!authenticatedUserId.equals(userId)) {
                throw new AccessDeniedException("You cannot access another user's notifications");
            }
        }

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    @PostMapping("/{notificationId}/send")
    public ResponseEntity<NotificationResponse> sendNotification(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        NotificationResponse existingNotification =
                notificationService.getNotification(notificationId);

        if (!isAdmin(authentication)) {
            String authenticatedUserId = getAuthenticatedUserId(authentication);

            if (!authenticatedUserId.equals(existingNotification.userId())) {
                throw new AccessDeniedException("You cannot send another user's notification");
            }
        }

        return ResponseEntity.ok(
                notificationService.sendNotification(notificationId)
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        NotificationResponse existingNotification =
                notificationService.getNotification(notificationId);

        if (!isAdmin(authentication)) {
            String authenticatedUserId = getAuthenticatedUserId(authentication);

            if (!authenticatedUserId.equals(existingNotification.userId())) {
                throw new AccessDeniedException("You cannot modify another user's notification");
            }
        }

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );
    }

    private String getAuthenticatedUserId(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaimAsString("userId");
    }

    private String getAccessToken(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getTokenValue();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                                || authority.getAuthority().equals("ROLE_SUPER_ADMIN")
                );
    }
}