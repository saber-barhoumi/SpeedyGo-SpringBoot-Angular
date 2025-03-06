package com.ski.speedygobackend.Service.TripManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;

import java.util.List;
import java.util.Optional;

public interface ITripServices {
    Trip addTrip(Trip trip);

    List<Trip> getAllTrips();

    Optional<Trip> getTripById(Long id);

    Trip updateTrip(Long id, Trip trip);

    void deleteTrip(Long id);
}