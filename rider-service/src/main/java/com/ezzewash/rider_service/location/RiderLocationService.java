package com.ezzewash.rider_service.location;

import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.location.dto.RiderLocationResponse;
import com.ezzewash.rider_service.location.dto.UpdateLocationRequest;
import com.ezzewash.rider_service.rider.Rider;
import com.ezzewash.rider_service.rider.RiderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RiderLocationService {

    private final RiderRepository riderRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public void updateLocation(
            UUID riderId,
            UpdateLocationRequest request,
            String userId
    ) {
        Rider rider = riderRepository
                .findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );

        if (!rider.getUserId().equals(userId)) {
            throw new ConflictException(
                    "Rider cannot update another rider"
            );
        }

        if (!rider.isActive()) {
            throw new ConflictException(
                    "Rider is inactive"
            );
        }

        if (!rider.isOnline()) {
            throw new ConflictException(
                    "Rider is offline"
            );
        }

        String key =
                "rider:" + riderId + ":location";

        Map<String, String> location =
                new HashMap<>();

        location.put(
                "latitude",
                request.latitude().toString()
        );

        location.put(
                "longitude",
                request.longitude().toString()
        );

        location.put(
                "updatedAt",
                LocalDateTime.now().toString()
        );

        redisTemplate.opsForHash()
                .putAll(key, location);
    }

    public RiderLocationResponse getLocation(
            UUID riderId
    ) {
        if (!riderRepository.existsById(riderId)) {
            throw new ResourceNotFoundException(
                    "Rider not found"
            );
        }

        String key =
                "rider:" + riderId + ":location";

        Map<Object, Object> location =
                redisTemplate.opsForHash()
                        .entries(key);

        if (location.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Rider location not found"
            );
        }

        Double latitude =
                Double.valueOf(
                        location.get("latitude").toString()
                );

        Double longitude =
                Double.valueOf(
                        location.get("longitude").toString()
                );

        LocalDateTime updatedAt =
                LocalDateTime.parse(
                        location.get("updatedAt").toString()
                );

        return new RiderLocationResponse(
                riderId,
                latitude,
                longitude,
                updatedAt
        );
    }

    public void deleteLocation(
            UUID riderId
    ) {
        if (!riderRepository.existsById(riderId)) {
            throw new ResourceNotFoundException(
                    "Rider not found"
            );
        }

        String key =
                "rider:" + riderId + ":location";

        redisTemplate.delete(key);
    }
}