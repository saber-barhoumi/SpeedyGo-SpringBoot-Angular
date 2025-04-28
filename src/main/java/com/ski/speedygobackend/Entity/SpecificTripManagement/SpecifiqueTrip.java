package com.ski.speedygobackend.Entity.SpecificTripManagement;


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
public class SpecifiqueTrip  implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tripDetails;
    private String departureLocation;
    private String destination;
    private String origin;
    @Temporal(TemporalType.DATE)
    private LocalDate departureDate;
    private String departureTime;
    private String arrivalTime;
    private double price;
    @Enumerated (EnumType.STRING)
    VehicleType vehicleType;


    @OneToOne
    private Reservation reservation;
}
