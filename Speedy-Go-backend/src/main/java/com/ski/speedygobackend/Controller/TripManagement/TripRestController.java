package com.ski.speedygobackend.Controller.TripManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Service.TripManagement.ITripServices;
import com.ski.speedygobackend.Service.TripManagement.TripServicesImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trips")
public class TripRestController {


    private final TripServicesImpl tripService;

    public TripRestController(TripServicesImpl tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    @GetMapping("/getTrip/{id}")
    public Trip getTrip(@PathVariable Long id) {
        return tripService.getTripById(id).orElse(null);
    }

    @PostMapping("/add")
    public Trip createTrip(@RequestBody Trip trip) {
        return tripService.addTrip(trip);
    }

    @PutMapping("/updateTrip/{id}")
    public Trip updateTrip(@PathVariable Long id, @RequestBody Trip trip) {
        return tripService.updateTrip(id, trip);
    }

    @DeleteMapping("/deleteTrip/{id}")
    public void deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
    }


}