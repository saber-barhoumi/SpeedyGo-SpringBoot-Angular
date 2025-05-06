package com.ski.speedygobackend.Repository.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.DeliveryManagement.ServiceRating;
import com.ski.speedygobackend.Entity.UserManagement.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRatingRepository extends JpaRepository<ServiceRating, Long> {

    // Find rating by user and service
    Optional<ServiceRating> findByUserAndService(User user, DeliveryService service);

    // Find all ratings for a service
    List<ServiceRating> findByService(DeliveryService service);

    // Find all ratings by a user
    List<ServiceRating> findByUser(User user);

    // Calculate average rating for a service
    @Query("SELECT AVG(r.rating) FROM ServiceRating r WHERE r.service.serviceId = :serviceId")
    Double calculateAverageRating(@Param("serviceId") Long serviceId);

    // Count ratings for a service
    @Query("SELECT COUNT(r) FROM ServiceRating r WHERE r.service.serviceId = :serviceId")
    Long countRatingsByServiceId(@Param("serviceId") Long serviceId);

    // Get rating distribution for a service
    @Query("SELECT ROUND(r.rating) as ratingValue, COUNT(r) as count " +
            "FROM ServiceRating r WHERE r.service.serviceId = :serviceId " +
            "GROUP BY ROUND(r.rating) ORDER BY ROUND(r.rating)")
    List<Object[]> getRatingDistribution(@Param("serviceId") Long serviceId);
}