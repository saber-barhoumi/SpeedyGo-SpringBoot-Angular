package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Repository.TripsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:4200")
public class TripsController {
    private static final Logger logger = LoggerFactory.getLogger(TripsController.class);

    private final TripsRepository tripsRepository;

    @Autowired
    public TripsController(TripsRepository tripsRepository) {
        this.tripsRepository = tripsRepository;
    }

    @GetMapping
    public ResponseEntity<List<Trips>> getAllTrips() {
        List<Trips> trips = tripsRepository.findAll();
        logger.info("Retrieved {} trips", trips.size());
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/find")
    public ResponseEntity<?> findTripByLocations(
            @RequestParam String departure,
            @RequestParam String destination) {

        logger.info("Looking up trip: {} to {}", departure, destination);

        Optional<Trips> trip = tripsRepository.findByDepartureCityAndArrivalCity(departure, destination);

        if (trip.isPresent()) {
            logger.info("Found trip: {}", trip.get());
            return ResponseEntity.ok(trip.get());
        } else {
            logger.warn("Trip not found: {} to {}", departure, destination);

            // Check if reverse trip exists
            Optional<Trips> reverseTrip = tripsRepository.findByDepartureCityAndArrivalCity(
                    destination, departure);

            if (reverseTrip.isPresent()) {
                logger.info("Found reverse trip, adapting data");
                Trips original = reverseTrip.get();

                // Create new trip with reversed locations but same data
                Trips adapted = Trips.builder()
                        .departureCity(departure)
                        .arrivalCity(destination)
                        .distanceKm(original.getDistanceKm())
                        .durationMinutes(original.getDurationMinutes())
                        .vehicleType(original.getVehicleType())
                        .fuelType(original.getFuelType())
                        .weatherType(original.getWeatherType())
                        .wifi(original.getWifi())
                        .airConditioning(original.getAirConditioning())
                        .build();

                return ResponseEntity.ok(adapted);
            }

            return ResponseEntity.notFound().build();
        }
    }
}