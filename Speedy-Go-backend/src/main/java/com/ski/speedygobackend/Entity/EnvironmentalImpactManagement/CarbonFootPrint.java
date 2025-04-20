package com.ski.speedygobackend.Entity.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import com.ski.speedygobackend.Enum.Energie;
import com.ski.speedygobackend.Enum.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class CarbonFootPrint implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long CarbonFootPrintId;

    private double emissionCo2;



    @Enumerated(EnumType.STRING)
    @Column(name = "Energie")
    Energie energie;

    private double consommationParKm;

    private Double capaciteMaxColis;

    @Enumerated(EnumType.STRING)
    @Column(name = "VehicleType")
    VehicleType vehicleType;



}
