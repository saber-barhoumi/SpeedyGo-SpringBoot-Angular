package com.ski.speedygobackend.Service.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Repository.TripsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class TripsDataInitializer implements CommandLineRunner {

    private final TripsRepository tripsRepository;
    private final Logger logger = LoggerFactory.getLogger(TripsDataInitializer.class);

    @Autowired
    public TripsDataInitializer(TripsRepository tripsRepository) {
        this.tripsRepository = tripsRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking if trips data needs to be initialized...");

        if (tripsRepository.count() > 0) {
            logger.info("Trips data already exists, skipping initialization");
            return;
        }

        logger.info("Initializing trips data...");

        // Create default trips for common routes in Tunisia
        Trips[] defaultTrips = {
                createTrip("Tunis", "Ariana", 10.0, 15, "sedan", "gasoline", "Clear"),
                createTrip("Tunis", "Ben Arous", 15.0, 20, "sedan", "gasoline", "Clear"),
                createTrip("Ben Arous", "Ariana", 25.0, 30, "sedan", "gasoline", "Clear"),
                createTrip("Tunis", "Sfax", 270.0, 180, "sedan", "gasoline", "Clear"),
                createTrip("Tunis", "Sousse", 140.0, 90, "sedan", "gasoline", "Clear"),
                createTrip("Tunis", "Bizerte", 65.0, 70, "sedan", "gasoline", "Clear"),
                createTrip("Ariana", "Sfax", 280.0, 190, "sedan", "gasoline", "Clear"),
                createTrip("Ariana", "Sousse", 150.0, 100, "sedan", "gasoline", "Clear"),
                createTrip("Ariana", "Bizerte", 55.0, 60, "sedan", "gasoline", "Clear"),
                createTrip("Sfax", "Sousse", 130.0, 85, "sedan", "gasoline", "Clear"),
                createTrip("Sfax", "Bizerte", 335.0, 250, "sedan", "gasoline", "Clear"),
                createTrip("Sousse", "Bizerte", 195.0, 160, "sedan", "gasoline", "Clear")
        };

        for (Trips trip : defaultTrips) {
            tripsRepository.save(trip);
        }

        logger.info("Saved {} default trips", defaultTrips.length);
    }

    private Trips createTrip(String departure, String arrival, Double distanceKm,
                             Integer durationMinutes, String vehicleType,
                             String fuelType, String weatherType) {
        return Trips.builder()
                .departureCity(departure)
                .arrivalCity(arrival)
                .distanceKm(distanceKm)
                .durationMinutes(durationMinutes)
                .vehicleType(vehicleType)
                .fuelType(fuelType)
                .weatherType(weatherType)
                .wifi(0)
                .airConditioning(0)
                .build();
    }
}