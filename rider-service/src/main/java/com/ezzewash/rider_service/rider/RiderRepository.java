package com.ezzewash.rider_service.rider;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiderRepository
        extends JpaRepository<Rider, UUID> {

    Optional<Rider> findByUserId(
            String userId
    );

    boolean existsByUserId(
            String userId
    );

    List<Rider> findByActiveTrueAndOnlineTrue();

    List<Rider> findByBranchIdAndActiveTrueAndOnlineTrue(
            String branchId
    );
}