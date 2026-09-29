    package com.ezzewash.rider_service.rating;

    import com.ezzewash.rider_service.rating.dto.CreateRatingRequest;
    import com.ezzewash.rider_service.rating.dto.RatingResponse;
    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.HttpStatus;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.UUID;

    @RestController
    @RequestMapping("/api/v1/riders/{riderId}/ratings")
    @RequiredArgsConstructor
    public class RiderRatingController {

        private final RiderRatingService ratingService;

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        public RatingResponse createRating(
                @PathVariable UUID riderId,
                @Valid @RequestBody CreateRatingRequest request
        ) {
            return RatingResponse.from(
                    ratingService.createRating(
                            riderId,
                            request
                    )
            );
        }

        @GetMapping("/{ratingId}")
        public RatingResponse getRating(
                @PathVariable UUID riderId,
                @PathVariable UUID ratingId
        ) {
            return RatingResponse.from(
                    ratingService.getRating(ratingId)
            );
        }

        @GetMapping
        public List<RatingResponse> getRiderRatings(
                @PathVariable UUID riderId
        ) {
            return ratingService
                    .getRiderRatings(riderId)
                    .stream()
                    .map(RatingResponse::from)
                    .toList();
        }
    }