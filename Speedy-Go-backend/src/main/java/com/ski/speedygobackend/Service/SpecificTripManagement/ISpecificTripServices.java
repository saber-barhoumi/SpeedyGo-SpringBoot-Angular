package com.ski.speedygobackend.Service.SpecificTripManagement;

import com.ski.speedygobackend.Entity.SpecificTripManagement.SpecifiqueTrip;
import com.ski.speedygobackend.Enum.VehicleType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ISpecificTripServices {

    List<SpecifiqueTrip> getAllTrips();
    Optional<SpecifiqueTrip> getTripById(Long id);
    SpecifiqueTrip createTrip(SpecifiqueTrip trip);
    SpecifiqueTrip updateTrip(Long id, SpecifiqueTrip trip);
    void deleteTrip(Long id);

    void deleteAllTrips();

    // Méthodes de recherche avancées
    List<SpecifiqueTrip> findTripsByDepartureDate(LocalDate departureDate);


}
