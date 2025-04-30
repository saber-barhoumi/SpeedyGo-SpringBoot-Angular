package com.ski.speedygobackend.Controller.EnvironmentalImpactManagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ski.speedygobackend.DTO.CarbonFootPrintDTO;
import com.ski.speedygobackend.Service.EnvironmentalImpactManagement.CarbonFootprintServicesImpl;
import org.springframework.beans.factory.annotation.Autowired;
import java.net.http.HttpRequest;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/carbon")
public class CarbonFootprintRestController {

    @Autowired
    private CarbonFootprintServicesImpl carbonFootprintServices;

    @GetMapping("/data")
    public List<CarbonFootPrintDTO> getCarbonData() {
        List<CarbonFootPrintDTO> carbonData = carbonFootprintServices.getAllAsDTO();
        if (carbonData.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "No data available");
        }
        return carbonData;
    }

    @PostMapping("/predict")
    public ResponseEntity<String> predictEmission() throws IOException, InterruptedException {
        List<CarbonFootPrintDTO> data = carbonFootprintServices.getAllAsDTO();
        String json = new ObjectMapper().writeValueAsString(data);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:5000/predict"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        return ResponseEntity.ok(response.body());
    }
}
