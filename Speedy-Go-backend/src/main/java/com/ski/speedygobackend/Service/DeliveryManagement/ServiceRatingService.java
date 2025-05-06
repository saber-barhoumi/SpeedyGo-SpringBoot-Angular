package com.ski.speedygobackend.Service.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.DeliveryManagement.ServiceRating;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.DeliveryManagement.DeliveryServiceRepository;
import com.ski.speedygobackend.Repository.DeliveryManagement.ServiceRatingRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ServiceRatingService {

    private final ServiceRatingRepository ratingRepository;
    private final DeliveryServiceRepository serviceRepository;
    private final IUserRepository userRepository;

    @Autowired
    public ServiceRatingService(
            ServiceRatingRepository ratingRepository,
            DeliveryServiceRepository serviceRepository,
            IUserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    /**
     * Rate a service or update an existing rating
     */
    @Transactional
    public DeliveryService rateService(Long serviceId, String email, Double rating) {
        // Validate rating
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Get the user and service
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        DeliveryService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        // Check if the user has already rated this service
        Optional<ServiceRating> existingRating = ratingRepository.findByUserAndService(user, service);

        if (existingRating.isPresent()) {
            // Update existing rating
            ServiceRating serviceRating = existingRating.get();
            serviceRating.updateRating(rating);
            ratingRepository.save(serviceRating);
        } else {
            // Create new rating
            ServiceRating serviceRating = ServiceRating.createRating(user, service, rating);
            ratingRepository.save(serviceRating);
        }

        // Recalculate the service's average rating
        updateServiceRatingStats(serviceId);

        return serviceRepository.findById(serviceId).orElse(service);
    }

    /**
     * Get all ratings for a service
     */
    public List<ServiceRating> getServiceRatings(Long serviceId) {
        DeliveryService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        return ratingRepository.findByService(service);
    }

    /**
     * Get ratings given by a user
     */
    public List<Map<String, Object>> getUserServiceRatings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        List<ServiceRating> ratings = ratingRepository.findByUser(user);

        return ratings.stream()
                .map(rating -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("serviceId", rating.getService().getServiceId());
                    // Removed serviceName since getName() doesn't exist
                    result.put("rating", rating.getRating());
                    result.put("comment", rating.getComment());
                    result.put("ratedAt", rating.getCreatedAt());
                    return result;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get rating statistics for a service
     */
    public Map<String, Object> getServiceRatingStats(Long serviceId) {
        DeliveryService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        Double averageRating = ratingRepository.calculateAverageRating(serviceId);
        Long totalRatings = ratingRepository.countRatingsByServiceId(serviceId);
        List<Object[]> distributionData = ratingRepository.getRatingDistribution(serviceId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("serviceId", serviceId);
        // Removed serviceName since getName() doesn't exist
        stats.put("totalRatings", totalRatings);
        stats.put("averageRating", averageRating != null ? Math.round(averageRating * 10) / 10.0 : 0.0);

        // Convert distribution data to a map
        Map<Integer, Long> distribution = new HashMap<>();
        for (Object[] data : distributionData) {
            Integer ratingValue = ((Number) data[0]).intValue();
            Long count = (Long) data[1];
            distribution.put(ratingValue, count);
        }

        // Ensure all rating values (1-5) are present in the distribution
        for (int i = 1; i <= 5; i++) {
            distribution.putIfAbsent(i, 0L);
        }

        stats.put("ratingDistribution", distribution);

        return stats;
    }

    /**
     * Update the service's rating statistics in the database
     * This version doesn't modify the DeliveryService entity directly
     */
    @Transactional
    protected void updateServiceRatingStats(Long serviceId) {
        // This method now just ensures the service exists
        serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        // The actual average and count are calculated on-demand in getServiceRatingStats
    }
}