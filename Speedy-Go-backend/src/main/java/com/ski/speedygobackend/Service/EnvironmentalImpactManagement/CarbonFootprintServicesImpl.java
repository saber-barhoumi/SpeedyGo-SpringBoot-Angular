package com.ski.speedygobackend.Service.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Repository.ICarbonFootprintRepository;
import org.apache.commons.csv.*;
import org.apache.commons.csv.CSVFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import  org.springframework.http.HttpHeaders;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CarbonFootprintServicesImpl  {

    @Autowired
    private ICarbonFootprintRepository carbonFootprintRepository;

    public void exportCarbonFootPrintToCSV(String filePath) throws IOException {
        List<CarbonFootPrint> carbonFootPrintList = carbonFootprintRepository.findAll();

        // Define CSV header
        String[] headers = {
                "CarbonFootPrintId",
                "EmissionCo2",
                "Energie",
                "ConsommationParKm",
                "CapaciteMaxColis",
                "VehicleType"
        };

        try (Writer writer = new FileWriter(filePath);
             CSVPrinter csvPrinter = new CSVPrinter(writer,
                     CSVFormat.DEFAULT
                             .withHeader(headers)
                             .withDelimiter(','))) {

            for (CarbonFootPrint carbonFootPrint : carbonFootPrintList) {
                csvPrinter.printRecord(
                        carbonFootPrint.getCarbonFootPrintId(),
                        carbonFootPrint.getEmissionCo2(),
                        carbonFootPrint.getEnergie(),
                        carbonFootPrint.getConsommationParKm(),
                        carbonFootPrint.getCapaciteMaxColis(),
                        carbonFootPrint.getVehicleType()
                );
            }

            csvPrinter.flush(); // Ensure data is written
        }
    }

    public List<Map<String, Object>> analyzeCSVWithAI(String filePath) {
        RestTemplate restTemplate = new RestTemplate();

        String flaskApiUrl = "http://localhost:5000/predict_from_csv";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> request = new HashMap<>();
        request.put("file_path", filePath);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(request, headers);

        ResponseEntity<List> response = restTemplate.exchange(
                flaskApiUrl,
                HttpMethod.POST,
                requestEntity,
                List.class
        );

        return response.getBody(); // retourne la liste avec prédictions
    }

}