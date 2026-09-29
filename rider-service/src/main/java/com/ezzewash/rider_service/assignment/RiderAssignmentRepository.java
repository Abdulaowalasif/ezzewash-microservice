package com.ezzewash.rider_service.assignment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RiderAssignmentRepository
        extends JpaRepository<RiderAssignment, UUID> {

    List<RiderAssignment> findByRiderId(
            UUID riderId
    );

    Page<RiderAssignment> findByRiderId(
            UUID riderId,
            Pageable pageable
    );

    List<RiderAssignment> findByRiderIdAndStatusIn(
            UUID riderId,
            List<AssignmentStatus> statuses
    );

    List<RiderAssignment> findByOrderId(
            String orderId
    );

    boolean existsByOrderIdAndStatusNot(
            String orderId,
            AssignmentStatus status
    );
}