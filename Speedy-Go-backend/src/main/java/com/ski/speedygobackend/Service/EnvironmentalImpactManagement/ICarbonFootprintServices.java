package com.ski.speedygobackend.Service.EnvironmentalImpactManagement;

import com.ski.speedygobackend.DTO.CarbonFootPrintDTO;

import java.util.List;

public interface ICarbonFootprintServices {
    List<CarbonFootPrintDTO> getAllAsDTO();
}
