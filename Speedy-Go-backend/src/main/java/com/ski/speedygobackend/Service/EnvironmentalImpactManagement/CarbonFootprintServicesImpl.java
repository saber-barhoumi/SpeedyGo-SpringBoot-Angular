package com.ski.speedygobackend.Service.EnvironmentalImpactManagement;

import com.ski.speedygobackend.DTO.CarbonFootPrintDTO;
import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Repository.ICarbonFootprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarbonFootprintServicesImpl implements ICarbonFootprintServices {

    private final ICarbonFootprintRepository carbonFootPrintRepository;

    @Override
    public List<CarbonFootPrintDTO> getAllAsDTO() {
        return carbonFootPrintRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CarbonFootPrintDTO mapToDTO(CarbonFootPrint entity) {
        CarbonFootPrintDTO dto = new CarbonFootPrintDTO();
        dto.setEnergie(entity.getEnergie().name()); // Enum to String
        dto.setConsommationParKm(entity.getConsommationParKm());
        dto.setCapaciteMaxColis(entity.getCapaciteMaxColis());
        dto.setVehicleType(entity.getVehicleType().name()); // Enum to String
        dto.setEmissionCo2(entity.getEmissionCo2());
        return dto;
    }
}
