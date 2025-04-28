package com.ski.speedygobackend.Service.RouteOptimizationManagement;

import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import com.ski.speedygobackend.Repository.ISmartRouteRepository;
import com.ski.speedygobackend.model.TripHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SmartRouteServicesImpl implements ISmartRouteServices {

    private final ISmartRouteRepository smartRouteRepository;
    private final TripHistoryService tripHistoryService;
    private final TrafficPredictionService trafficPredictionService;

    @Override
    @Transactional
    public SmartRoute saveRoute(SmartRoute route) {

        // Estimation de carburant
        route.setFuelEstimate(calculateFuelEstimate(route.getDistance()));

        return smartRouteRepository.save(route);
    }

    @Override
    public List<SmartRoute> findHistoricalSimilarRoutes(String start, String end) {
        return smartRouteRepository.findByStartLocationAndEndLocation(start, end);
    }

    private double calculateFuelEstimate(double distance) {
        // Modèle simplifié - à remplacer par un modèle plus précis
        double averageConsumption = 7.5; // litres/100km
        return (distance / 1000) * (averageConsumption / 100);
    }
}