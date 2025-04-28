package com.ski.speedygobackend.Controller.RouteOptimizationManagement;

import com.ski.speedygobackend.model.TripHistory;
import com.ski.speedygobackend.Service.RouteOptimizationManagement.TripHistoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
public class TripHistoryController {

    private final TripHistoryService service;

    public TripHistoryController(TripHistoryService service) {
        this.service = service;
    }

    @PostMapping
    public TripHistory save(@RequestBody TripHistory trip) {
        return service.save(trip);
    }
}
