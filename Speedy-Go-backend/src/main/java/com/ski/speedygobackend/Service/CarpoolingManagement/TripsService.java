package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Repository.TripsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TripsService {
    private static final Logger logger = LoggerFactory.getLogger(TripsService.class);

    private final TripsRepository tripsRepository;

    @Autowired
    public TripsService(TripsRepository tripsRepository) {
        this.tripsRepository = tripsRepository;
    }

    public Trips findByLocations(String departure, String destination) {
        logger.info("Looking up trip details for {} to {}", departure, destination);

        // Search for the trip in the database
        Optional<Trips> tripOptional = tripsRepository.findByDepartureCityAndArrivalCity(departure, destination);

        if (tripOptional.isPresent()) {
            Trips trip = tripOptional.get();
            logger.info("Found trip in database: {} to {}, {}km, {}min",
                    trip.getDepartureCity(), trip.getArrivalCity(),
                    trip.getDistanceKm(), trip.getDurationMinutes());
            return trip;
        }

        // If trip not found in main direction, try reverse direction (if applicable)
        tripOptional = tripsRepository.findByDepartureCityAndArrivalCity(destination, departure);
        if (tripOptional.isPresent()) {
            Trips trip = tripOptional.get();
            logger.info("Found reverse trip in database: {} to {} (reversed), {}km, {}min",
                    trip.getDepartureCity(), trip.getArrivalCity(),
                    trip.getDistanceKm(), trip.getDurationMinutes());

            // Create a new trip instance with reversed direction but same data
            Trips reversedTrip = new Trips();
            reversedTrip.setDepartureCity(departure);
            reversedTrip.setArrivalCity(destination);
            reversedTrip.setDistanceKm(trip.getDistanceKm());
            reversedTrip.setDurationMinutes(trip.getDurationMinutes());
            reversedTrip.setVehicleType(trip.getVehicleType());
            reversedTrip.setFuelType(trip.getFuelType());
            reversedTrip.setWeatherType(trip.getWeatherType());

            return reversedTrip;
        }

        // If no trip found in either direction, log a warning
        logger.warn("Trip not found in database for {} to {}, creating default trip", departure, destination);

        // Create a default trip with estimated values based on known cities
        Trips defaultTrip = createDefaultTrip(departure, destination);

        // Optionally save this default trip to the database for future use
        if (defaultTrip != null) {
            logger.info("Saving default trip to database");
            tripsRepository.save(defaultTrip);
        }

        return defaultTrip;
    }

    private Trips createDefaultTrip(String departure, String destination) {
        Trips trip = new Trips();
        trip.setDepartureCity(departure);
        trip.setArrivalCity(destination);
        trip.setVehicleType("sedan");
        trip.setFuelType("gasoline");
        trip.setWeatherType("Clear");

        // Set reasonable default values based on known routes in Tunisia
        if (departure.equals(destination)) {
            trip.setDistanceKm(0.0);
            trip.setDurationMinutes(0);
        }
        else if ((departure.equals("Tunis") && destination.equals("Ariana")) ||
                (departure.equals("Ariana") && destination.equals("Tunis"))) {
            trip.setDistanceKm(10.0);
            trip.setDurationMinutes(15);
        }
        else if ((departure.equals("Tunis") && destination.equals("Ben Arous")) ||
                (departure.equals("Ben Arous") && destination.equals("Tunis"))) {
            trip.setDistanceKm(15.0);
            trip.setDurationMinutes(20);
        }
        else if ((departure.equals("Ben Arous") && destination.equals("Ariana")) ||
                (departure.equals("Ariana") && destination.equals("Ben Arous"))) {
            trip.setDistanceKm(25.0);
            trip.setDurationMinutes(30);
        }
        // Add other known routes...
        else {
            // Try to estimate based on geography - this is just a fallback
            // In a real system, you'd use a distance API or more sophisticated method
            trip.setDistanceKm(50.0); // Default distance
            trip.setDurationMinutes(60); // Default duration
            logger.warn("Using very rough estimate for unknown route: {} to {}", departure, destination);
        }

        return trip;
    }
}