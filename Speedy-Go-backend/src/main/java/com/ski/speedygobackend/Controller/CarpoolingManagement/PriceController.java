package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Service.CarpoolingManagement.AIService;
import com.ski.speedygobackend.Service.CarpoolingManagement.TripsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/price")
@CrossOrigin(origins = "http://localhost:4200")
public class PriceController {
    private static final Logger logger = LoggerFactory.getLogger(PriceController.class);

    private final AIService aiService;
    private final TripsService tripsService;

    @Autowired
    public PriceController(AIService aiService, TripsService tripsService) {
        this.aiService = aiService;
        this.tripsService = tripsService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculatePrice(@RequestBody Carpooling carpooling) {
        try {
            logger.info("Calculating price for carpooling: departure={}, destination={}, distanceKm={}",
                    carpooling.getDepartureLocation(), carpooling.getDestination(), carpooling.getDistanceKm());

            // If departure and destination are set but distance or duration is missing, look up trip data
            if (carpooling.getDepartureLocation() != null && !carpooling.getDepartureLocation().isEmpty() &&
                    carpooling.getDestination() != null && !carpooling.getDestination().isEmpty() &&
                    (carpooling.getDistanceKm() == null || carpooling.getDistanceKm() <= 0 ||
                            carpooling.getDurationMinutes() == null || carpooling.getDurationMinutes() <= 0)) {

                logger.info("Looking up trip data for {} to {}",
                        carpooling.getDepartureLocation(), carpooling.getDestination());

                Trips trip = tripsService.findByLocations(
                        carpooling.getDepartureLocation(), carpooling.getDestination());

                if (trip != null) {
                    // Update carpooling with trip data
                    carpooling.setDistanceKm(trip.getDistanceKm());
                    carpooling.setDurationMinutes(trip.getDurationMinutes());
                    carpooling.setVehicleType(trip.getVehicleType());
                    carpooling.setFuelType(trip.getFuelType());
                    carpooling.setWeatherType(trip.getWeatherType());

                    logger.info("Trip data found: distance={}km, duration={}min",
                            carpooling.getDistanceKm(), carpooling.getDurationMinutes());
                }
            }

            // Add null checks and default values for other fields
            if (carpooling.getDistanceKm() == null) {
                carpooling.setDistanceKm(0.0);
            }
            if (carpooling.getDurationMinutes() == null) {
                carpooling.setDurationMinutes(0);
            }
            if (carpooling.getVehicleType() == null) {
                carpooling.setVehicleType("sedan");
            }
            if (carpooling.getFuelType() == null) {
                carpooling.setFuelType("gasoline");
            }
            if (carpooling.getAvailableSeats() == 1) {
                carpooling.setAvailableSeats(1);
            }
            if (carpooling.getWifi() == null) {
                carpooling.setWifi(0);
            }
            if (carpooling.getAirConditioning() == null) {
                carpooling.setAirConditioning(0);
            }
            if (carpooling.getWeatherType() == null) {
                carpooling.setWeatherType("Clear");
            }

            // Calculate price using AI service
            double price = aiService.calculatePrice(carpooling);
            logger.info("Price calculated: {}", price);

            // Return price along with the updated distance and duration
            Map<String, Object> response = new HashMap<>();
            response.put("price", price);
            response.put("distanceKm", carpooling.getDistanceKm());
            response.put("durationMinutes", carpooling.getDurationMinutes());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error calculating price", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}