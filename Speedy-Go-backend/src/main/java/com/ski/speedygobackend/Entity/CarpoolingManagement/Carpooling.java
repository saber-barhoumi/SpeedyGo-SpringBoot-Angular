package com.ski.speedygobackend.Entity.CarpoolingManagement;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

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
    @Column(nullable = false) // Make sure it's not nullable
    Long userId;
    @NotNull
    @Column(nullable = false)
    String departureLocation;
    @NotNull
    @Column(nullable = false)
    String destination;
    @Column(nullable = true)
    LocalDateTime arrivalTime;
    @Column(nullable = true)
    int availableSeats;
    @Column(nullable = false)
    double pricePerSeat;
    @Column(nullable = true)
    private  String description;

    @Column(nullable = false)
    Double distanceKm;
    @Column(nullable = false)
    Integer durationMinutes;
    @Column(nullable = false)
    String vehicleType;
    @Column(nullable = false)
    String fuelType;
    @Column(nullable = true)
    Integer wifi;

    @Column(nullable = true)
    Integer airConditioning;
    @Column(nullable = true)
    private String status;
    @Column(nullable = true)
    String weatherType;
    @ManyToOne
    private Trip trip;

    @OneToMany(mappedBy = "carpooling", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationCarpoo> reservationCarpoos;
}