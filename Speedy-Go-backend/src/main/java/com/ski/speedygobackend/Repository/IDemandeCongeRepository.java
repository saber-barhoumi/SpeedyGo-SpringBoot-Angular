package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.RecrutementManagement.DemandeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDemandeCongeRepository extends JpaRepository<DemandeConge, Long> {
    List<DemandeConge> findByDeliveryVehicleVehicleId(Long vehicleId);
}