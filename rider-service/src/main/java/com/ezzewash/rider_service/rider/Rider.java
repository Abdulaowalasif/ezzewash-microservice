package com.ezzewash.rider_service.rider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "riders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rider {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private String userId;

    @Column(
            name = "branch_id",
            nullable = false
    )
    private String branchId;

    @Column(
            name = "is_active",
            nullable = false
    )
    private boolean active;

    @Column(
            name = "is_online",
            nullable = false
    )
    private boolean online;

    @Column(
            nullable = false,
            precision = 3,
            scale = 2
    )
    private BigDecimal rating;

    @Column(
            name = "total_deliveries",
            nullable = false
    )
    private int totalDeliveries;

    @Column(
            name = "total_earnings",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalEarnings;

    @Column(
            name = "cash_in_hand",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal cashInHand;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }
}