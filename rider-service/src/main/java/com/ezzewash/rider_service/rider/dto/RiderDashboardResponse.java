package com.ezzewash.rider_service.rider.dto;

import com.ezzewash.rider_service.assignment.dto.AssignmentResponse;

import java.util.List;

public record RiderDashboardResponse(
        RiderSummaryResponse summary,
        List<AssignmentResponse> activeAssignments
) {
}