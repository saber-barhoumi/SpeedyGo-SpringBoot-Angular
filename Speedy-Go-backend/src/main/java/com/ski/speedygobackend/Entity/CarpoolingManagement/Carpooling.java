package com.ski.speedygobackend.Entity.CarpoolingManagement;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import jakarta.persistence.*;
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
    Long CarpoolingId;

    String departureLocation;
    String destination;

    @Column(nullable = false)
    LocalDateTime departureTime;
    LocalDateTime arrivalTime;

    @Column(nullable = false)
    int availableSeats;

    @Column(nullable = false)
    double pricePerSeat;

    private  String descrition;

    @ManyToOne
    private Trip trip;
}
