package com.ski.speedygobackend.Service.TripManagement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import com.ski.speedygobackend.Repository.IVehicleRepository;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleServicesImpl implements IVehicleServices {
    private final IVehicleRepository vehicleRepository;

    @Autowired
    public VehicleServicesImpl(IVehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    /*
    @Override
    public Vehicle updateVehicle(Long id, Vehicle vehicle) {
        if (vehicleRepository.existsById(id)) {
            vehicle.setId(id);
            return vehicleRepository.save(vehicle);
        }
        return null; // ou lancer une exception si nécessaire
    }
            */



    @Override
    public void deleteVehicle(Long id) {
        if (vehicleRepository.existsById(id)) {
            vehicleRepository.deleteById(id);
        }
    }
}
