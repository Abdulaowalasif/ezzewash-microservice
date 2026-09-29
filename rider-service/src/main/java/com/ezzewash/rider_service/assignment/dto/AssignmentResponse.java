package com.ezzewash.rider_service.assignment.dto;

import com.ezzewash.rider_service.assignment.AssignmentStatus;
import com.ezzewash.rider_service.assignment.RiderAssignment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssignmentResponse(
        UUID id,
        UUID riderId,
        String orderId,
        AssignmentStatus status,
        LocalDateTime assignedAt,
        LocalDateTime acceptedAt,
        LocalDateTime pickedUpAt,
        LocalDateTime deliveredAt,
        BigDecimal earning,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static AssignmentResponse from(
            RiderAssignment assignment
    ) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getRider().getId(),
                assignment.getOrderId(),
                assignment.getStatus(),
                assignment.getAssignedAt(),
                assignment.getAcceptedAt(),
                assignment.getPickedUpAt(),
                assignment.getDeliveredAt(),
                assignment.getEarning(),
                assignment.getCreatedAt(),
                assignment.getUpdatedAt()
        );
    }
}