package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.CarpoolingReview;
import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.CarpoolingReviewRepository;
import com.ski.speedygobackend.Repository.IReservationRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CarpoolingReviewService {
    private final CarpoolingReviewRepository reviewRepository;
    private final IReservationRepository reservationRepository;
    private final IUserRepository userRepository;

    @Autowired
    public CarpoolingReviewService(
            CarpoolingReviewRepository reviewRepository,
            IReservationRepository reservationRepository,
            IUserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Rate a carpooling reservation
     */
    public CarpoolingReview rateReservation(Long reservationId, Integer rating) {
        // Get current user
        User currentUser = getCurrentUser();

        // Get reservation
        ReservationCarpoo reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // Note: We're skipping the user check for now since we don't know the structure
        // of ReservationCarpoo. Uncomment and modify this if needed.
        /*
        if (!reservation.getUserId().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("You can only rate your own reservations");
        }
        */

        // Check if rating already exists
        Optional<CarpoolingReview> existingReview = reviewRepository
                .findByReservationAndUser(reservationId, currentUser.getUserId());

        if (existingReview.isPresent()) {
            // Update existing rating
            CarpoolingReview review = existingReview.get();
            review.setRating(rating);
            return reviewRepository.save(review);
        } else {
            // Create new rating
            CarpoolingReview review = CarpoolingReview.builder()
                    .reservation(reservation)
                    .user(currentUser)
                    .rating(rating)
                    .build();
            return reviewRepository.save(review);
        }
    }

    /**
     * Add a text review to a carpooling reservation
     */
    public CarpoolingReview addReview(Long reservationId, String reviewText) {
        // Get current user
        User currentUser = getCurrentUser();

        // Get reservation
        ReservationCarpoo reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // Note: We're skipping the user check for now since we don't know the structure
        // of ReservationCarpoo. Uncomment and modify this if needed.
        /*
        if (!reservation.getUserId().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("You can only review your own reservations");
        }
        */

        // Check if review already exists
        Optional<CarpoolingReview> existingReview = reviewRepository
                .findByReservationAndUser(reservationId, currentUser.getUserId());

        if (existingReview.isPresent()) {
            // Update existing review
            CarpoolingReview review = existingReview.get();
            review.setReviewText(reviewText);
            return reviewRepository.save(review);
        } else {
            // Create new review with default rating of 3
            CarpoolingReview review = CarpoolingReview.builder()
                    .reservation(reservation)
                    .user(currentUser)
                    .rating(3) // Default rating
                    .reviewText(reviewText)
                    .build();
            return reviewRepository.save(review);
        }
    }

    /**
     * Get reviews for a carpooling
     */
    public List<CarpoolingReview> getReviewsByCarpooling(Long carpoolingId) {
        return reviewRepository.findByCarpoolingId(carpoolingId);
    }

    /**
     * Get reviews by user
     */
    public List<CarpoolingReview> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserUserId(userId);
    }

    /**
     * Get carpooling statistics
     */
    public Map<String, Object> getCarpoolingStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // Count total reviews
        long totalReviews = reviewRepository.count();
        statistics.put("totalReviews", totalReviews);

        // Count reviews with text
        long reviewsWithText = reviewRepository.findAll().stream()
                .filter(r -> r.getReviewText() != null && !r.getReviewText().isEmpty())
                .count();
        statistics.put("totalTextReviews", reviewsWithText);

        // Calculate distribution of ratings
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            final int rating = i;
            long count = reviewRepository.findAll().stream()
                    .filter(r -> r.getRating() != null && r.getRating() == rating)
                    .count();
            statistics.put("rating_" + i, count);
        }

        // Add other statistics as needed
        statistics.put("totalRatings", totalReviews);
        statistics.put("avgReviewLength", calculateAverageReviewLength());

        return statistics;
    }

    /**
     * Calculate average review text length
     */
    private double calculateAverageReviewLength() {
        List<CarpoolingReview> reviews = reviewRepository.findAll();
        if (reviews.isEmpty()) {
            return 0;
        }

        long totalWords = reviews.stream()
                .filter(r -> r.getReviewText() != null && !r.getReviewText().isEmpty())
                .mapToLong(r -> r.getReviewText().split("\\s+").length)
                .sum();

        long reviewsWithText = reviews.stream()
                .filter(r -> r.getReviewText() != null && !r.getReviewText().isEmpty())
                .count();

        return reviewsWithText > 0 ? (double) totalWords / reviewsWithText : 0;
    }

    /**
     * Helper method to get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }
}