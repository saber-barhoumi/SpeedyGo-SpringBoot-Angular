package com.ski.speedygobackend.Controller.TripManagement;


import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import com.ski.speedygobackend.Service.TripManagement.IVehicleServices;
import com.ski.speedygobackend.Service.TripManagement.VehicleServicesImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Tag(name = "🚗 Vehicle Management")  // Swagger Tag for Vehicle management
@RestController
@RequestMapping("/api/vehicles")
public class VehicleRestController {
    private final VehicleServicesImpl vehicleService;

    @Autowired
    public VehicleRestController(VehicleServicesImpl vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public Vehicle getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicleById(id).orElse(null);  // ou gérer exception
    }

    @PostMapping("/add")
    public Vehicle createVehicle(@RequestBody Vehicle vehicle) {
        return vehicleService.addVehicle(vehicle);
    }
/*
    @PutMapping("/update/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return vehicleService.updateVehicle(id, vehicle);
    }
*/

    @DeleteMapping("/delete/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
    }
}
