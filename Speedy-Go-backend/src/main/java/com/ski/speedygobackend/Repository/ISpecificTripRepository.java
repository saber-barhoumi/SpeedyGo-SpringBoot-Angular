package com.ski.speedygobackend.Repository;


import com.ski.speedygobackend.Entity.SpecificTripManagement.SpecifiqueTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISpecificTripRepository extends JpaRepository<SpecifiqueTrip, Long> {

    // Recherche par destination

    // Recherche par type de véhicule

    // Recherche par prix inférieur à une valeur donnée

    // Recherche par date de départ
    List<SpecifiqueTrip> findByDepartureDate(java.time.LocalDate departureDate);
}
