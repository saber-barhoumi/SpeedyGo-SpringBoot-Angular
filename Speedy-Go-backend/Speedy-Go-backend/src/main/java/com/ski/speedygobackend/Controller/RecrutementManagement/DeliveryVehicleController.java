package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Enum.VehicleType;
import com.ski.speedygobackend.Service.RecrutementManagement.IDeliveryVehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveryvehicles")
@CrossOrigin(origins = "http://localhost:4200")
public class DeliveryVehicleController {

    private final IDeliveryVehicleService deliveryVehicleService;

    @Autowired
    public DeliveryVehicleController(IDeliveryVehicleService deliveryVehicleService) {
        this.deliveryVehicleService = deliveryVehicleService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryVehicle>> getAllVehicles() {
        return ResponseEntity.ok(deliveryVehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryVehicle> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryVehicleService.getVehicleById(id));
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody DeliveryVehicle deliveryVehicle) {
        try {
            DeliveryVehicle createdVehicle = deliveryVehicleService.createVehicle(deliveryVehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody DeliveryVehicle vehicleDetails) {
        try {
            DeliveryVehicle updatedVehicle = deliveryVehicleService.updateVehicle(id, vehicleDetails);
            return ResponseEntity.ok(updatedVehicle);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            deliveryVehicleService.deleteVehicle(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/type/{vehicleType}")
    public ResponseEntity<List<DeliveryVehicle>> getVehiclesByType(@PathVariable VehicleType vehicleType) {
        return ResponseEntity.ok(deliveryVehicleService.getVehiclesByType(vehicleType));
    }

    @GetMapping("/check-license-plate")
    public ResponseEntity<Map<String, Boolean>> checkLicensePlate(@RequestParam String licensePlate) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", deliveryVehicleService.isLicensePlateAlreadyRegistered(licensePlate));
        return ResponseEntity.ok(response);
    }
}