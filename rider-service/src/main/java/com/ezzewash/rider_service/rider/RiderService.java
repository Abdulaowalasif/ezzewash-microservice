package com.ezzewash.rider_service.rider;

import com.ezzewash.rider_service.auth.AuthClient;
import com.ezzewash.rider_service.auth.dto.AuthUserResponse;
import com.ezzewash.rider_service.catalog.CatalogAuthorizationService;
import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.rider.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import com.ezzewash.rider_service.assignment.RiderAssignmentService;
import com.ezzewash.rider_service.assignment.dto.AssignmentResponse;

@Service
@RequiredArgsConstructor
public class RiderService {

    private final RiderRepository riderRepository;
    private final CatalogAuthorizationService catalogAuthorizationService;
    private final RiderAssignmentService riderAssignmentService;
    private final AuthClient authClient;

    public Rider createRider(
            CreateRiderRequest request,
            String adminUserId,
            String adminToken
    ) {
        if (riderRepository.existsByUserId(
                request.userId()
        )) {
            throw new ConflictException(
                    "Rider already exists for this user"
            );
        }

        boolean authorized =
                catalogAuthorizationService
                        .hasActiveBranchMembership(
                                adminUserId,
                                request.branchId()
                        );

        if (!authorized) {
            throw new ConflictException(
                    "Admin does not have access to this branch"
            );
        }

        AuthUserResponse authUser = authClient.getUserById(request.userId(), adminToken);
        if (authUser == null) {
            throw new ResourceNotFoundException("User not found in Auth Service");
        }

        Rider rider = Rider.builder()
                .userId(request.userId())
                .branchId(request.branchId())
                .firstName(authUser.firstName())
                .lastName(authUser.lastName())
                .phone(authUser.phone())
                .profilePicture(authUser.profilePicture())
                .vehicleType(request.vehicleType())
                .vehicleNumber(request.vehicleNumber())
                .active(true)
                .online(false)
                .rating(BigDecimal.ZERO)
                .totalDeliveries(0)
                .totalEarnings(BigDecimal.ZERO)
                .cashInHand(BigDecimal.ZERO)
                .build();

        return riderRepository.save(rider);
    }

    public Rider getRider(UUID riderId) {
        return riderRepository.findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );
    }

    public Rider getRiderByUserId(
            String userId
    ) {
        return riderRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );
    }

    public List<Rider> getAllRiders() {
        return riderRepository.findAll();
    }

    public Rider updateActiveStatus(
            UUID riderId,
            UpdateRiderActiveRequest request,
            String adminUserId
    ) {
        Rider rider = getRider(riderId);

        boolean authorized =
                catalogAuthorizationService
                        .hasActiveBranchMembership(
                                adminUserId,
                                rider.getBranchId()
                        );

        if (!authorized) {
            throw new ConflictException(
                    "Admin does not have access to this branch"
            );
        }

        rider.setActive(request.active());

        if (!request.active()) {
            rider.setOnline(false);
        }

        return riderRepository.save(rider);
    }

    public Rider updateOnlineStatus(
            UUID riderId,
            UpdateRiderOnlineRequest request,
            String userId
    ) {
        Rider rider = getRider(riderId);

        if (!rider.getUserId().equals(userId)) {
            throw new ConflictException(
                    "Rider cannot update another rider"
            );
        }

        if (!rider.isActive() && request.online()) {
            throw new ConflictException(
                    "Inactive rider cannot be online"
            );
        }

        rider.setOnline(request.online());

        return riderRepository.save(rider);
    }

    public RiderSummaryResponse getRiderSummary(
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
                    "Rider cannot access another rider's summary"
            );
        }

        return new RiderSummaryResponse(
                rider.getId(),
                rider.getUserId(),
                rider.getBranchId(),
                rider.isActive(),
                rider.isOnline(),
                rider.getRating(),
                rider.getTotalDeliveries(),
                rider.getTotalEarnings(),
                rider.getCashInHand(),
                rider.getFirstName(),
                rider.getLastName(),
                rider.getPhone(),
                rider.getProfilePicture(),
                rider.getVehicleType(),
                rider.getVehicleNumber()
        );
    }

    @Transactional
    public Rider updateActiveStatus(
            UUID riderId,
            Boolean active
    ) {
        Rider rider =
                riderRepository
                        .findById(riderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rider not found"
                                )
                        );

        rider.setActive(active);

        if (!active) {
            rider.setOnline(false);
        }

        return riderRepository.save(rider);
    }


    @Transactional
    public Rider updateOnlineStatus(
            UUID riderId,
            Boolean online,
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
                    "Rider cannot update another rider's status"
            );
        }

        if (!rider.isActive() && online) {
            throw new ConflictException(
                    "Inactive rider cannot go online"
            );
        }

        rider.setOnline(online);

        return riderRepository.save(rider);
    }

    public List<Rider> getAvailableRiders() {
        return riderRepository
                .findByActiveTrueAndOnlineTrue();
    }

    public List<Rider> getAvailableRidersByBranch(
            String branchId
    ) {
        return riderRepository
                .findByBranchIdAndActiveTrueAndOnlineTrue(
                        branchId
                );
    }

    public RiderDashboardResponse getRiderDashboard(
            String userId
    ) {
        Rider rider =
                riderRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rider not found"
                                )
                        );

        RiderSummaryResponse summary =
                getRiderSummary(
                        rider.getId(),
                        userId,
                        "RIDER"
                );

        List<AssignmentResponse> activeAssignments =
                riderAssignmentService
                        .getActiveAssignments(
                                rider.getId(),
                                userId,
                                "RIDER"
                        )
                        .stream()
                        .map(AssignmentResponse::from)
                        .toList();

        return new RiderDashboardResponse(
                summary,
                activeAssignments
        );
    }
}