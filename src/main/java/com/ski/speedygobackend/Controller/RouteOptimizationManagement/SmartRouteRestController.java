package com.ski.speedygobackend.Controller.RouteOptimizationManagement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ski.speedygobackend.Dto.RouteRequest;
import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import com.ski.speedygobackend.Service.RouteOptimizationManagement.ISmartRouteServices;
import com.ski.speedygobackend.Service.RouteOptimizationManagement.TrafficPredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class SmartRouteRestController {

    @Value("${ors.api.key}")
    private String apiKey;

    @Value("${ors.api.url}")
    private String orsApiUrl;

    private final ISmartRouteServices smartRouteService;
    private final TrafficPredictionService trafficPredictionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @PostMapping("/smart")
    public ResponseEntity<?> getSmartRoute(@Valid @RequestBody RouteRequest routeRequest) {
        try {
            // 1. Appel à l'API OpenRouteService
            String routeResponse = callOpenRouteService(routeRequest);

            // 2. Extraction des données
            SmartRoute route = extractRouteData(routeResponse, routeRequest);

            // 3. Enrichissement avec données IA
            enrichWithAIData(route);

            // 4. Sauvegarde
            SmartRoute savedRoute = smartRouteService.saveRoute(route);

            return ResponseEntity.ok(savedRoute.getRouteSummary());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{start}/{end}")
    public List<SmartRoute> getRouteHistory(
            @PathVariable String start,
            @PathVariable String end) {
        return smartRouteService.findHistoricalSimilarRoutes(start, end);
    }

    private String callOpenRouteService(RouteRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("""
        {
          "coordinates": [
            [%f, %f],
            [%f, %f]
          ],
          "options": {
            "avoid_features": ["highways", "tolls"],
            "preference": "fastest"
          }
        }
        """, request.getFromLon(), request.getFromLat(),
                request.getToLon(), request.getToLat());

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(orsApiUrl, entity, String.class);
    }

    private SmartRoute extractRouteData(String json, RouteRequest request) throws Exception {
        JsonNode root = objectMapper.readTree(json);

        SmartRoute route = new SmartRoute();
        route.setRouteName("De " + request.getFromLabel() + " à " + request.getToLabel());
        route.setStartLocation(request.getFromLabel());
        route.setEndLocation(request.getToLabel());
        route.setRouteDetails(json);
        route.setDistance(root.at("/features/0/properties/segments/0/distance").asDouble());
        route.setEstimatedTime(Duration.ofSeconds(
                (long) root.at("/features/0/properties/segments/0/duration").asDouble()));

        return route;
    }

    private void enrichWithAIData(SmartRoute route) {
        // Prédiction du trafic
        var prediction = trafficPredictionService.predictTraffic(
                route.getStartLocation(),
                route.getEndLocation(),
                LocalDateTime.now()
        );

        route.setTrafficLevel(prediction.getLevel());
        route.setTrafficConfidence(prediction.getConfidence()); // nouveau champ à ajouter dans SmartRoute


        // Trouver des itinéraires similaires historiques
        List<SmartRoute> similarRoutes = smartRouteService
                .findHistoricalSimilarRoutes(
                        route.getStartLocation(),
                        route.getEndLocation());

        // Ajouter des alternatives si disponibles
        if (!similarRoutes.isEmpty()) {
            route.setAlternativeRoutes(
                    objectMapper.valueToTree(similarRoutes).toString());
        }
    }
}