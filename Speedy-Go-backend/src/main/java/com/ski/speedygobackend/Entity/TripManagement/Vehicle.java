package com.ski.speedygobackend.Entity.TripManagement;

import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Vehicle implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String type;

    String licensePlate;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;




}

