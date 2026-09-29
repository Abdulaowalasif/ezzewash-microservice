package com.ezzewash.rider_service.assignment.dto;

import com.ezzewash.rider_service.assignment.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAssignmentStatusRequest(

        @NotNull(message = "Status is required")
        AssignmentStatus status

) {
}