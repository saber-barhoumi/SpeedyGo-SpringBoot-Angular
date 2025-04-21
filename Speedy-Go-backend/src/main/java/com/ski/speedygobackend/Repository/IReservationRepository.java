package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IReservationRepository extends JpaRepository<ReservationCarpoo, Long> {
    List<ReservationCarpoo> findByUserId(Long userId);

    @Query("SELECT r FROM ReservationCarpoo r JOIN r.carpooling c WHERE r.userId = :userId AND c.startTime > :startTime")
    List<ReservationCarpoo> findByUserIdAndCarpoolingStartTimeAfter(@Param("userId") Long userId, @Param("startTime") LocalDateTime startTime);
}