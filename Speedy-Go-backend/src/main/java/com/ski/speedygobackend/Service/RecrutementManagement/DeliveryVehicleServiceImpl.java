package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Enum.VehicleType;
import com.ski.speedygobackend.Repository.IDeliveryVehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryVehicleServiceImpl implements IDeliveryVehicleService {

    private final IDeliveryVehicleRepository deliveryVehicleRepository;

    @Autowired
    public DeliveryVehicleServiceImpl(IDeliveryVehicleRepository deliveryVehicleRepository) {
        this.deliveryVehicleRepository = deliveryVehicleRepository;
    }

    @Override
    public List<DeliveryVehicle> getAllVehicles() {
        return deliveryVehicleRepository.findAll();
    }

    @Override
    public DeliveryVehicle getVehicleById(Long id) {
        return deliveryVehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    @Override
    public DeliveryVehicle createVehicle(DeliveryVehicle deliveryVehicle) {
        // Validate license plate is unique
        if (isLicensePlateAlreadyRegistered(deliveryVehicle.getLicensePlate())) {
            throw new RuntimeException("A vehicle with this license plate already exists");
        }

        return deliveryVehicleRepository.save(deliveryVehicle);
    }

    @Override
    public DeliveryVehicle updateVehicle(Long id, DeliveryVehicle vehicleDetails) {
        DeliveryVehicle vehicle = getVehicleById(id);

        // If license plate is changing, check if the new one is unique
        if (!vehicle.getLicensePlate().equals(vehicleDetails.getLicensePlate()) &&
                isLicensePlateAlreadyRegistered(vehicleDetails.getLicensePlate())) {
            throw new RuntimeException("A vehicle with this license plate already exists");
        }

        // Update fields
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setYearOfManufacture(vehicleDetails.getYearOfManufacture());
        vehicle.setLicensePlate(vehicleDetails.getLicensePlate());
        vehicle.setRegistrationNumber(vehicleDetails.getRegistrationNumber());
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setMaxLoadCapacity(vehicleDetails.getMaxLoadCapacity());
        vehicle.setHasRefrigeration(vehicleDetails.getHasRefrigeration());
        vehicle.setIsInsured(vehicleDetails.getIsInsured());
        vehicle.setInsuranceProvider(vehicleDetails.getInsuranceProvider());
        vehicle.setInsurancePolicyNumber(vehicleDetails.getInsurancePolicyNumber());
        vehicle.setVehiclePhotoPath(vehicleDetails.getVehiclePhotoPath());

        return deliveryVehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicle(Long id) {
        DeliveryVehicle vehicle = getVehicleById(id);
        deliveryVehicleRepository.delete(vehicle);
    }

    @Override
    public List<DeliveryVehicle> getVehiclesByType(VehicleType vehicleType) {
        return deliveryVehicleRepository.findByVehicleType(vehicleType);
    }

    @Override
    public boolean isLicensePlateAlreadyRegistered(String licensePlate) {
        return deliveryVehicleRepository.existsByLicensePlate(licensePlate);
    }
}