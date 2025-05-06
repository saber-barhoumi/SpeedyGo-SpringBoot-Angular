package com.ski.speedygobackend.Service.TripManagement;

import com.ski.speedygobackend.Entity.TripManagement.Vehicle;

import java.util.List;
import java.util.Optional;

public interface IVehicleServices {
    Vehicle addVehicle(Vehicle vehicle);
    List<Vehicle> getAllVehicles();
    Optional<Vehicle> getVehicleById(Long id);
    void deleteVehicle(Long id);

    // Vehicle updateVehicle(Long id, Vehicle vehicle);

}

