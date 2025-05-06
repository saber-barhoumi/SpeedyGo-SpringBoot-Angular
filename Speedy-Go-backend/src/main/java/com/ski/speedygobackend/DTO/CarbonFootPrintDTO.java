package com.ski.speedygobackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarbonFootPrintDTO {
    private String vehicleType;          // Exemple : "CAMION"
    private String energie;               // Exemple : "Diesel"
    private double consommationParKm;     // Exemple : 0.12
    private double capaciteMaxColis;      // Exemple : 300.0
    private double emissionCo2;           // Peut être rempli à la prédiction
}
