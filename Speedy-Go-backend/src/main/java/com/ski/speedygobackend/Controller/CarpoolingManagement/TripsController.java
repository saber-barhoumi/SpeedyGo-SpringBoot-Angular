package com.ski.speedygobackend.Controller.CarpoolingManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Trips;
import com.ski.speedygobackend.Service.CarpoolingManagement.TripsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/trips")
public class TripsController {

    @Autowired
    private TripsService tripService;

    @GetMapping("/find")
    public ResponseEntity<Trips> findTripByLocations(
            @RequestParam String departure,
            @RequestParam String destination) {
        Trips  trip = tripService.findByLocations(departure, destination);
        return ResponseEntity.ok(trip);
    }
}