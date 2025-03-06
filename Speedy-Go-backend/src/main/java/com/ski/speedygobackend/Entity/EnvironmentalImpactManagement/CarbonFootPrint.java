package com.ski.speedygobackend.Entity.EnvironmentalImpactManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
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

    private double emission;
    private  LocalDate dateRecord;
    private String description;

    @ManyToOne
    private Trip trip;
}
