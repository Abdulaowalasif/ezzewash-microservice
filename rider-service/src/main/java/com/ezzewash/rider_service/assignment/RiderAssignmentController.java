package com.ezzewash.rider_service.assignment;

import com.ezzewash.rider_service.assignment.dto.AssignmentPageResponse;
import com.ezzewash.rider_service.assignment.dto.AssignmentResponse;
import com.ezzewash.rider_service.assignment.dto.CreateAssignmentRequest;
import com.ezzewash.rider_service.assignment.dto.UpdateAssignmentStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/v1/rider-assignments")
@RequiredArgsConstructor
public class RiderAssignmentController {

    private final RiderAssignmentService assignmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssignmentResponse createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request
    ) {
        return AssignmentResponse.from(
                assignmentService.createAssignment(request)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @GetMapping("/{assignmentId}")
    public AssignmentResponse getAssignment(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return AssignmentResponse.from(
                assignmentService.getAssignment(
                        assignmentId,
                        jwt.getClaimAsString("userId"),
                        jwt.getClaimAsString("role")
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @GetMapping("/rider/{riderId}")
    public AssignmentPageResponse getRiderAssignments(
            @PathVariable UUID riderId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Page<AssignmentResponse> result =
                assignmentService
                        .getRiderAssignments(
                                riderId,
                                jwt.getClaimAsString("userId"),
                                jwt.getClaimAsString("role"),
                                PageRequest.of(
                                        page,
                                        limit,
                                        Sort.by(
                                                Sort.Direction.DESC,
                                                "createdAt"
                                        )
                                )
                        )
                        .map(AssignmentResponse::from);

        return new AssignmentPageResponse(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast()
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @GetMapping("/order/{orderId}")
    public List<AssignmentResponse> getOrderAssignments(
            @PathVariable String orderId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return assignmentService
                .getOrderAssignments(
                        orderId,
                        jwt.getClaimAsString("userId"),
                        jwt.getClaimAsString("role")
                )
                .stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RIDER')")
    @GetMapping("/rider/{riderId}/active")
    public List<AssignmentResponse> getActiveAssignments(
            @PathVariable UUID riderId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return assignmentService
                .getActiveAssignments(
                        riderId,
                        jwt.getClaimAsString("userId"),
                        jwt.getClaimAsString("role")
                )
                .stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    @PreAuthorize("hasRole('RIDER')")
    @PatchMapping("/{assignmentId}/status")
    public AssignmentResponse updateStatus(
            @PathVariable UUID assignmentId,
            @Valid @RequestBody UpdateAssignmentStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return AssignmentResponse.from(
                assignmentService.updateStatus(
                        assignmentId,
                        request,
                        jwt.getClaimAsString("userId")
                )
        );
    }

    @PreAuthorize("hasRole('RIDER')")
    @GetMapping("/{assignmentId}/order")
    public JsonNode getAssignmentOrder(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return assignmentService.getAssignmentOrder(
                assignmentId,
                jwt.getClaimAsString("userId")
        );
    }
}