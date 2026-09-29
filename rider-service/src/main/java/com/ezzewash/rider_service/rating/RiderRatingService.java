package com.ezzewash.rider_service.rating;

import com.ezzewash.rider_service.common.exception.ConflictException;
import com.ezzewash.rider_service.common.exception.ResourceNotFoundException;
import com.ezzewash.rider_service.rating.dto.CreateRatingRequest;
import com.ezzewash.rider_service.rider.Rider;
import com.ezzewash.rider_service.rider.RiderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RiderRatingService {

    private final RiderRatingRepository ratingRepository;
    private final RiderRepository riderRepository;

    @Transactional
    public RiderRating createRating(
            UUID riderId,
            CreateRatingRequest request
    ) {
        Rider rider = riderRepository
                .findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"
                        )
                );

        if (ratingRepository.existsByOrderId(
                request.orderId()
        )) {
            throw new ConflictException(
                    "Order has already been rated"
            );
        }

        RiderRating rating =
                RiderRating.builder()
                        .rider(rider)
                        .userId(request.userId())
                        .orderId(request.orderId())
                        .rating(request.rating())
                        .comment(request.comment())
                        .build();

        RiderRating savedRating =
                ratingRepository.save(rating);

        updateRiderRating(rider);

        return savedRating;
    }

    public RiderRating getRating(
            UUID ratingId
    ) {
        return ratingRepository
                .findById(ratingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rating not found"
                        )
                );
    }

    public List<RiderRating> getRiderRatings(
            UUID riderId
    ) {
        if (!riderRepository.existsById(riderId)) {
            throw new ResourceNotFoundException(
                    "Rider not found"
            );
        }

        return ratingRepository
                .findByRiderId(riderId);
    }

    private void updateRiderRating(
            Rider rider
    ) {
        List<RiderRating> ratings =
                ratingRepository.findByRiderId(
                        rider.getId()
                );

        BigDecimal total =
                ratings.stream()
                        .map(RiderRating::getRating)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal average =
                total.divide(
                        BigDecimal.valueOf(
                                ratings.size()
                        ),
                        2,
                        RoundingMode.HALF_UP
                );

        rider.setRating(average);

        riderRepository.save(rider);
    }
}