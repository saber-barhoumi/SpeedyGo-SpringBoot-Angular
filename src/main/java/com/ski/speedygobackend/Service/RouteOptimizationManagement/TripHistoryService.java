package com.ski.speedygobackend.Service.RouteOptimizationManagement;

import com.ski.speedygobackend.model.TripHistory;
import com.ski.speedygobackend.Repository.TripHistoryRepository;
import org.springframework.stereotype.Service;

@Service
public class TripHistoryService {

    private final TripHistoryRepository repo;

    public TripHistoryService(TripHistoryRepository repo) {
        this.repo = repo;
    }

    public TripHistory save(TripHistory trip) {
        return repo.save(trip);
    }
}
