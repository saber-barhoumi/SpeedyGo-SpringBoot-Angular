
package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
@PersistenceContext(unitName = "sqlitePersistenceUnit")
public interface TripsRepository extends JpaRepository<Trips, Long> {
    @Query("SELECT t FROM Trips t WHERE " +
            "LOWER(t.departureCity) = LOWER(:departure) AND " +
            "LOWER(t.arrivalCity) = LOWER(:destination)")
    Optional<Trips> findByDepartureCityAndArrivalCity(
            @Param("departure") String departure,
            @Param("destination") String destination
    );
}