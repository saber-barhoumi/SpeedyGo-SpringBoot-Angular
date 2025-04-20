package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Service.CarpoolingManagement.ICarpoolingServices;
import com.ski.speedygobackend.Service.CarpoolingManagement.TripsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/carpoolings")
public class CarpoolingRestController {
    private static final Logger logger = LoggerFactory.getLogger(CarpoolingRestController.class);

    private final ICarpoolingServices carpoolingServices;
    private final TripsService tripsService; // Add the TripsService

    @Autowired
    public CarpoolingRestController(ICarpoolingServices carpoolingServices, TripsService tripsService) {
        this.carpoolingServices = carpoolingServices;
        this.tripsService = tripsService; // Inject the TripsService
    }

    @GetMapping
    public ResponseEntity<List<Carpooling>> getAllCarpoolings() {
        return ResponseEntity.ok(carpoolingServices.getAllCarpoolings());
    }

    @GetMapping("/my-carpoolings")
    public ResponseEntity<List<Carpooling>> getMyCarpoolings(Principal principal) {
        return ResponseEntity.ok(carpoolingServices.getCarpoolingsByUser(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carpooling> getCarpooling(@PathVariable Long id) {
        return ResponseEntity.ok(carpoolingServices.getCarpoolingById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<Carpooling> createCarpooling(
            @RequestBody Carpooling carpooling,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.createCarpooling(carpooling, principal.getName()));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Carpooling> updateCarpooling(
            @PathVariable Long id,
            @RequestBody Carpooling carpooling,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.updateCarpooling(id, carpooling, principal.getName()));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCarpooling(
            @PathVariable Long id,
            Principal principal
    ) {
        carpoolingServices.deleteCarpooling(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Carpooling> acceptCarpooling(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(carpoolingServices.acceptCarpooling(id, principal.getName()));
    }

    // Keep the original price calculation endpoint for backward compatibility
    @PostMapping("/calculate-price")
    public ResponseEntity<?> calculatePrice(@RequestBody Carpooling carpooling) {
        try {
            logger.info("Original endpoint - Calculating price for: {}", carpooling);

            // If departure and destination are set but distance or duration is missing, look up trip data
            if (carpooling.getDepartureLocation() != null && !carpooling.getDepartureLocation().isEmpty() &&
                    carpooling.getDestination() != null && !carpooling.getDestination().isEmpty() &&
                    (carpooling.getDistanceKm() == null || carpooling.getDistanceKm() <= 0 ||
                            carpooling.getDurationMinutes() == null || carpooling.getDurationMinutes() <= 0)) {

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

            // Add null checks
            if (carpooling.getDistanceKm() == null) {
                carpooling.setDistanceKm(0.0);
            }
            if (carpooling.getDurationMinutes() == null) {
                carpooling.setDurationMinutes(0);
            }

            double price = carpoolingServices.calculatePrice(carpooling);
            logger.info("Calculated price: {}", price);

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