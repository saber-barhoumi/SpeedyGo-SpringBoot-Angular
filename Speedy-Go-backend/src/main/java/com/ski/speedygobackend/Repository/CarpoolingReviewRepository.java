package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.CarpoolingManagement.CarpoolingReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarpoolingReviewRepository extends JpaRepository<CarpoolingReview, Long> {
    // Find reviews by reservation ID
    List<CarpoolingReview> findByReservationReservationId(Long reservationId);

    // Find reviews by carpooling ID
    @Query("SELECT r FROM CarpoolingReview r " +
            "WHERE r.reservation.carpooling.carpoolingId = :carpoolingId")
    List<CarpoolingReview> findByCarpoolingId(@Param("carpoolingId") Long carpoolingId);

    // Find reviews by user ID - Fixed with JPQL query
    @Query("SELECT r FROM CarpoolingReview r WHERE r.user.UserId = :userId")
    List<CarpoolingReview> findByUserUserId(@Param("userId") Long userId);

    // Check if user has already reviewed a specific reservation - Using JPQL Query
    @Query("SELECT r FROM CarpoolingReview r WHERE r.reservation.reservationId = :reservationId AND r.user.UserId = :userId")
    Optional<CarpoolingReview> findByReservationAndUser(
            @Param("reservationId") Long reservationId,
            @Param("userId") Long userId);

    // Calculate average rating for a specific carpooling
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM CarpoolingReview r " +
            "WHERE r.reservation.carpooling.carpoolingId = :carpoolingId")
    Double calculateAverageRatingByCarpoolingId(@Param("carpoolingId") Long carpoolingId);

    // Calculate average rating for a specific driver's trips
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM CarpoolingReview r " +
            "WHERE r.reservation.carpooling.userId = :userId")
    Double calculateAverageRatingByDriverId(@Param("userId") Long userId);
}