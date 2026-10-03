package com.notification_service.repository;

import com.notification_service.entity.Notification;
import com.notification_service.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserId(String userId);

    List<Notification> findByStatus(NotificationStatus status);
}