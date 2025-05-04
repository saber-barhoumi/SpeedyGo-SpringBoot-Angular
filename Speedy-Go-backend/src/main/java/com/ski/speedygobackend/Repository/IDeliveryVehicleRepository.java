package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Enum.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDeliveryVehicleRepository extends JpaRepository<DeliveryVehicle, Long> {
    List<DeliveryVehicle> findByVehicleType(VehicleType vehicleType);
    boolean existsByLicensePlate(String licensePlate);
}