package com.ezzewash.rider_service.assignment;

import com.ezzewash.rider_service.assignment.dto.CreateAssignmentRequest;
import com.ezzewash.rider_service.assignment.dto.UpdateAssignmentStatusRequest;
import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.order.OrderClient;
import com.ezzewash.rider_service.rider.Rider;
import com.ezzewash.rider_service.rider.RiderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RiderAssignmentService {

    private final RiderAssignmentRepository assignmentRepository;
    private final RiderRepository riderRepository;
    private final OrderClient orderClient;

    @Value("${rider.assignment.fixed-earning}")
    private BigDecimal fixedEarning;

    public RiderAssignment createAssignment(
            CreateAssignmentRequest request
    ) {
        Rider rider = riderRepository
                .findById(request.riderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );

        if (!rider.isActive()) {
            throw new ConflictException(
                    "Rider is inactive"
            );
        }

        if (assignmentRepository.existsByOrderIdAndStatusNot(
                request.orderId(),
                AssignmentStatus.CANCELLED
        )) {
            throw new ConflictException(
                    "Order is already assigned"
            );
        }

        RiderAssignment assignment =
                RiderAssignment.builder()
                        .rider(rider)
                        .orderId(request.orderId())
                        .status(AssignmentStatus.ASSIGNED)
                        .assignedAt(LocalDateTime.now())
                        .earning(fixedEarning)
                        .build();

        return assignmentRepository.save(
                assignment
        );
    }

    @Transactional
    public RiderAssignment updateStatus(
            UUID assignmentId,
            UpdateAssignmentStatusRequest request,
            String userId
    ) {
        RiderAssignment assignment =
                getAssignment(
                        assignmentId,
                        userId,
                        "RIDER"
                );

        AssignmentStatus currentStatus =
                assignment.getStatus();

        AssignmentStatus newStatus =
                request.status();

        validateTransition(
                currentStatus,
                newStatus
        );

        assignment.setStatus(newStatus);

        LocalDateTime now =
                LocalDateTime.now();

        switch (newStatus) {
            case ACCEPTED -> assignment.setAcceptedAt(now);

            case PICKED_UP -> {
                assignment.setPickedUpAt(now);

                orderClient.updateOrderStatus(
                        assignment.getOrderId(),
                        "PICKED_UP"
                );
            }

            case DELIVERY_STARTED -> {
                orderClient.updateOrderStatus(
                        assignment.getOrderId(),
                        "OUT_FOR_DELIVERY"
                );
            }

            case DELIVERED -> {
                assignment.setDeliveredAt(now);

                Rider rider =
                        assignment.getRider();

                BigDecimal earning =
                        assignment.getEarning() != null
                                ? assignment.getEarning()
                                : BigDecimal.ZERO;

                rider.setTotalEarnings(
                        rider.getTotalEarnings()
                                .add(earning)
                );

                rider.setTotalDeliveries(
                        rider.getTotalDeliveries() + 1
                );

                riderRepository.save(rider);

                orderClient.updateOrderStatus(
                        assignment.getOrderId(),
                        "DELIVERED"
                );
            }

            default -> {
            }
        }

        return assignmentRepository.save(
                assignment
        );
    }

    public RiderAssignment getAssignment(
            UUID assignmentId,
            String userId,
            String role
    ) {
        RiderAssignment assignment =
                assignmentRepository
                        .findById(assignmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assignment not found"
                                )
                        );

        if (
                "RIDER".equals(role)
                        && !assignment.getRider()
                        .getUserId()
                        .equals(userId)
        ) {
            throw new ConflictException(
                    "Rider cannot access another rider's assignment"
            );
        }

        return assignment;
    }

    public List<RiderAssignment> getActiveAssignments(
            UUID riderId,
            String userId,
            String role
    ) {
        Rider rider =
                riderRepository
                        .findById(riderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rider not found"
                                )
                        );

        if (
                "RIDER".equals(role)
                        && !rider.getUserId().equals(userId)
        ) {
            throw new ConflictException(
                    "Rider cannot access another rider's assignments"
            );
        }

        return assignmentRepository
                .findByRiderIdAndStatusIn(
                        riderId,
                        List.of(
                                AssignmentStatus.ASSIGNED,
                                AssignmentStatus.ACCEPTED,
                                AssignmentStatus.PICKUP_STARTED,
                                AssignmentStatus.PICKED_UP,
                                AssignmentStatus.DELIVERY_STARTED
                        )
                );
    }

    public Page<RiderAssignment> getRiderAssignments(
            UUID riderId,
            String userId,
            String role,
            Pageable pageable
    ) {
        Rider rider =
                riderRepository
                        .findById(riderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rider not found"
                                )
                        );

        if (
                "RIDER".equals(role)
                        && !rider.getUserId().equals(userId)
        ) {
            throw new ConflictException(
                    "Rider cannot access another rider's assignments"
            );
        }

        return assignmentRepository.findByRiderId(
                riderId,
                pageable
        );
    }

    public List<RiderAssignment> getOrderAssignments(
            String orderId,
            String userId,
            String role
    ) {
        List<RiderAssignment> assignments =
                assignmentRepository
                        .findByOrderId(orderId);

        if (
                "RIDER".equals(role)
                        && assignments.stream()
                        .anyMatch(
                                assignment ->
                                        !assignment.getRider()
                                                .getUserId()
                                                .equals(userId)
                        )
        ) {
            throw new ConflictException(
                    "Rider cannot access another rider's assignment"
            );
        }

        return assignments;
    }

    private void validateTransition(
            AssignmentStatus currentStatus,
            AssignmentStatus newStatus
    ) {
        boolean valid = switch (currentStatus) {
            case ASSIGNED -> newStatus == AssignmentStatus.ACCEPTED
                    || newStatus == AssignmentStatus.REJECTED
                    || newStatus == AssignmentStatus.CANCELLED;

            case ACCEPTED -> newStatus == AssignmentStatus.PICKUP_STARTED
                    || newStatus == AssignmentStatus.CANCELLED;

            case PICKUP_STARTED -> newStatus == AssignmentStatus.PICKED_UP
                    || newStatus == AssignmentStatus.CANCELLED;

            case PICKED_UP -> newStatus == AssignmentStatus.DELIVERY_STARTED
                    || newStatus == AssignmentStatus.CANCELLED;

            case DELIVERY_STARTED -> newStatus == AssignmentStatus.DELIVERED
                    || newStatus == AssignmentStatus.CANCELLED;

            case REJECTED,
                 DELIVERED,
                 CANCELLED -> false;
        };

        if (!valid) {
            throw new ConflictException(
                    "Invalid assignment status transition"
            );
        }
    }

    public JsonNode getAssignmentOrder(
            UUID assignmentId,
            String userId
    ) {
        RiderAssignment assignment =
                getAssignment(
                        assignmentId,
                        userId,
                        "RIDER"
                );

        return orderClient.getOrder(
                assignment.getOrderId()
        );
    }
}