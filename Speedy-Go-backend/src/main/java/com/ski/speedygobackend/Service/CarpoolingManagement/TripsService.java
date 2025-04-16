// TripsService.java

package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Repository.TripsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TripsService {

    @Autowired
    private TripsRepository tripsRepository;

    public Trips findByLocations(String departure, String destination) {
        Trips trip = tripsRepository.findByDepartureLocationAndDestination(departure, destination);

        if (trip == null) {
            trip = new Trips();
            trip.setDepartureLocation(departure);
            trip.setDestination(destination);
            if (departure.equals(destination)) {
                trip.setDistance_km(0.0);
                trip.setDuration_minutes(0);
            }
            else if (departure.equals("Tunis") && destination.equals("Ariana")) {
                trip.setDistance_km(10.0);
                trip.setDuration_minutes(20);
            } else if (departure.equals("Tunis") && destination.equals("Sfax")) {
                trip.setDistance_km(270.0);
                trip.setDuration_minutes(180);
            } else {
                // Default fallback for unknown routes
                trip.setDistance_km(50.0);
                trip.setDuration_minutes(60);
            }
        }


        return trip;
    }
}
