package com.ski.speedygobackend.Entity.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Enum.Energie;
import com.ski.speedygobackend.Enum.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CarbonFootPrint implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long CarbonFootPrintId;

    private double emissionCo2;

    @Enumerated(EnumType.STRING)
    @Column(name = "Energie")
    private Energie energie;

    private double consommationParKm;

    private Double capaciteMaxColis;

    @Enumerated(EnumType.STRING)
    @Column(name = "VehicleType")
    private VehicleType vehicleType;
}
