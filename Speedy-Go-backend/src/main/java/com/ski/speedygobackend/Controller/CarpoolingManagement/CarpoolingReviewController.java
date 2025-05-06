package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.CarpoolingReview;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.CarpoolingManagement.CarpoolingReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class CarpoolingReviewController {
    private static final Logger logger = LoggerFactory.getLogger(CarpoolingReviewController.class);

    private final CarpoolingReviewService reviewService;
    private final IUserRepository userRepository;

    @Autowired
    public CarpoolingReviewController(
            CarpoolingReviewService reviewService,
            IUserRepository userRepository
    ) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/rate")
    @PreAuthorize("hasAnyRole('USER', 'DELIVERY')")
    public ResponseEntity<?> rateReservation(
            @RequestBody Map<String, Object> payload,
            Principal principal
    ) {
        try {
            // Extract reservation ID and rating from payload
            Long reservationId = Long.parseLong(payload.get("reservationId").toString());
            Integer rating = Integer.parseInt(payload.get("rating").toString());

            // Validate input
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid rating",
                        "message", "Rating must be between 1 and 5"
                ));
            }

            // Perform rating
            CarpoolingReview review = reviewService.rateReservation(reservationId, rating);

            return ResponseEntity.ok(Map.of(
                    "message", "Rating submitted successfully",
                    "review", review
            ));
        } catch (IllegalArgumentException e) {
            logger.error("Error rating reservation", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation Error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Unexpected error in rating reservation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "An unexpected error occurred"
            ));
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('USER', 'DELIVERY')")
    public ResponseEntity<?> addReview(
            @RequestBody Map<String, Object> payload,
            Principal principal
    ) {
        try {
            // Extract reservation ID and review text from payload
            Long reservationId = Long.parseLong(payload.get("reservationId").toString());
            String reviewText = payload.get("reviewText").toString();

            // Validate input
            if (reviewText == null || reviewText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid Review",
                        "message", "Review text cannot be empty"
                ));
            }

            // Add review
            CarpoolingReview review = reviewService.addReview(reservationId, reviewText);

            return ResponseEntity.ok(Map.of(
                    "message", "Review added successfully",
                    "review", review
            ));
        } catch (IllegalArgumentException e) {
            logger.error("Error adding review", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation Error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Unexpected error in adding review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "An unexpected error occurred"
            ));
        }
    }

    @GetMapping("/carpooling/{carpoolingId}")
    public ResponseEntity<?> getCarpoolingReviews(@PathVariable Long carpoolingId) {
        try {
            List<CarpoolingReview> reviews = reviewService.getReviewsByCarpooling(carpoolingId);

            return ResponseEntity.ok(Map.of(
                    "reviews", reviews,
                    "totalReviews", reviews.size()
            ));
        } catch (Exception e) {
            logger.error("Error fetching carpooling reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "Failed to fetch reviews"
            ));
        }
    }




    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('USER', 'DELIVERY', 'ADMIN')")
    public ResponseEntity<?> getCarpoolingStatistics() {
        try {
            Map<String, Object> statistics = reviewService.getCarpoolingStatistics();

            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error fetching carpooling statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "Failed to fetch carpooling statistics"
            ));
        }
    }

    // New method for detailed review insights
    @GetMapping("/insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDetailedReviewInsights() {
        try {
            Map<String, Object> insights = new HashMap<>();

            // Combine statistics with additional insights
            Map<String, Object> statistics = reviewService.getCarpoolingStatistics();
            insights.putAll(statistics);

            // Additional custom insights can be added here
            insights.put("reviewTrends", calculateReviewTrends());
            insights.put("popularRoutes", findPopularRoutes());

            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            logger.error("Error fetching review insights", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "Failed to fetch review insights"
            ));
        }
    }

    // Placeholder methods for additional insights
    private Map<String, Object> calculateReviewTrends() {
        // Implement logic to calculate review trends
        // E.g., reviews over time, rating distribution, etc.
        Map<String, Object> trends = new HashMap<>();
        trends.put("monthlyReviewCount", new int[12]); // Example: monthly review counts
        trends.put("ratingDistribution", Map.of(
                "1_star", 0,
                "2_star", 0,
                "3_star", 0,
                "4_star", 0,
                "5_star", 0
        ));
        return trends;
    }

    private List<Map<String, Object>> findPopularRoutes() {
        // Implement logic to find most frequently reviewed routes
        return List.of(
                Map.of(
                        "route", "Tunis to Sousse",
                        "totalReviews", 50,
                        "averageRating", 4.5
                ),
                Map.of(
                        "route", "Sousse to Sfax",
                        "totalReviews", 35,
                        "averageRating", 4.2
                )
        );
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUserReviews(Principal principal) {
        try {
            User user = userRepository
                    .findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<CarpoolingReview> reviews = reviewService.getReviewsByUser(user.getUserId());

            return ResponseEntity.ok(Map.of(
                    "reviews", reviews,
                    "totalReviews", reviews.size()
            ));
        } catch (Exception e) {
            logger.error("Error fetching user reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server Error",
                    "message", "Failed to fetch user reviews"
            ));
        }
    }

}