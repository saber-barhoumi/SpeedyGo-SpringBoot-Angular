package com.ski.speedygobackend.Entity.CarpoolingManagement;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class Carpooling implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long carpoolingId;
    @NotNull

    String departureLocation;
    String destination;
    @Column(nullable = true)
    LocalDateTime arrivalTime;

    int availableSeats;

    double pricePerSeat;

    private  String description;

    @ManyToOne
    private Trip trip;
}
