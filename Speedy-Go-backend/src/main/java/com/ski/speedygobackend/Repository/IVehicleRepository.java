package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IVehicleRepository extends JpaRepository<Vehicle, Long> {
}
