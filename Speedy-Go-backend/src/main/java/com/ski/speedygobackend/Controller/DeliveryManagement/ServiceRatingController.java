package com.ski.speedygobackend.Controller.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.DeliveryManagement.ServiceRating;
import com.ski.speedygobackend.Service.DeliveryManagement.DeliveryServiceService;
import com.ski.speedygobackend.Service.DeliveryManagement.ServiceRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-services")
@RequiredArgsConstructor
public class ServiceRatingController {

    private final ServiceRatingService serviceRatingService;
    private final DeliveryServiceService deliveryServiceService;

    /**
     * Rate a delivery service
     */
    @PostMapping("/{serviceId}/rate")
    public ResponseEntity<DeliveryService> rateService(
            @PathVariable Long serviceId,
            @RequestBody Map<String, Double> ratingData) {

        // Get the authenticated user's email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // This will be the email from JWT

        Double rating = ratingData.get("rating");
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }

        // Save the rating and get the updated service with new average rating
        DeliveryService updatedService = serviceRatingService.rateService(serviceId, email, rating);
        return ResponseEntity.ok(updatedService);
    }
    /**
     * Get all ratings for a service
     */
    @GetMapping("/{serviceId}/ratings")
    public ResponseEntity<List<ServiceRating>> getServiceRatings(@PathVariable Long serviceId) {
        List<ServiceRating> ratings = serviceRatingService.getServiceRatings(serviceId);
        return ResponseEntity.ok(ratings);
    }

    /**
     * Get user's ratings for services
     */
    @GetMapping("/ratings/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserServiceRatings(@PathVariable Long userId) {
        List<Map<String, Object>> ratings = serviceRatingService.getUserServiceRatings(userId);
        return ResponseEntity.ok(ratings);
    }

    /**
     * Get rating statistics for a service
     */
    @GetMapping("/{serviceId}/rating-stats")
    public ResponseEntity<Map<String, Object>> getServiceRatingStats(@PathVariable Long serviceId) {
        Map<String, Object> stats = serviceRatingService.getServiceRatingStats(serviceId);
        return ResponseEntity.ok(stats);
    }
}