package com.ski.speedygobackend.Controller.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Repository.IVehicleRepository;
import com.ski.speedygobackend.Service.EnvironmentalImpactManagement.CarbonFootprintServicesImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/carbon-footprint")
public class CarbonFootprintRestController {
   private  CarbonFootprintServicesImpl carbonFootprintServices;
    @GetMapping("/analyze")
    public ResponseEntity<?> analyzeCarbonFootprint() {
        String filePath = "C:\\Users\\medal\\Downloads\\SpeedyGo-SpringBoot-Angular\\Speedy-Go-backend\\carbon_data";
        try {
            carbonFootprintServices.exportCarbonFootPrintToCSV(filePath); // export CSV
            List<Map<String, Object>> predictions = carbonFootprintServices.analyzeCSVWithAI(filePath);
            return ResponseEntity.ok(predictions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur : " + e.getMessage());
        }
    }



}
