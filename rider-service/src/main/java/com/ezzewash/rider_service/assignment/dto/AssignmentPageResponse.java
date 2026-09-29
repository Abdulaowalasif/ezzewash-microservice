package com.ezzewash.rider_service.assignment.dto;

import java.util.List;

public record AssignmentPageResponse(
        List<AssignmentResponse> content,
        int page,
        int limit,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
}