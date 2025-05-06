package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Enum.VehicleType;

import java.util.List;

public interface IDeliveryVehicleService {
    List<DeliveryVehicle> getAllVehicles();
    DeliveryVehicle getVehicleById(Long id);
    DeliveryVehicle createVehicle(DeliveryVehicle deliveryVehicle);
    DeliveryVehicle updateVehicle(Long id, DeliveryVehicle vehicleDetails);
    void deleteVehicle(Long id);
    List<DeliveryVehicle> getVehiclesByType(VehicleType vehicleType);
    boolean isLicensePlateAlreadyRegistered(String licensePlate);
}