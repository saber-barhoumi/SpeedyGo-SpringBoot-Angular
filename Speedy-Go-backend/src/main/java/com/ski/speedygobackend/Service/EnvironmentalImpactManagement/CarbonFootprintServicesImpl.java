package com.ski.speedygobackend.Service.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Repository.IDeliveryVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonFootprintServicesImpl implements ICarbonFootprintServices {

    private final IDeliveryVehicleRepository deliveryVehicleRepository;

    @Override
    public List<DeliveryVehicle> getAllAsDTO() {
        // Bien que le nom soit  getAllAsDTO, il retourne maintenant directement des entités
        return deliveryVehicleRepository.findAll();
    }
}
