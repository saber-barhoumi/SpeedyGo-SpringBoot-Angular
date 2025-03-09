package com.ski.speedygobackend.Entity.CarpoolingManagement;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @Column(nullable = true)
    String departureLocation;
    @Column(nullable = true)
    String destination;
    @Column(nullable = true)
    LocalDateTime arrivalTime;
    @Column(nullable = true)
    int availableSeats;
    @Column(nullable = true)
    double pricePerSeat;
    @Column(nullable = true)
    private  String description;

    @ManyToOne
    @JsonManagedReference

    private Trip trip;
    @OneToMany(mappedBy = "carpooling", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<ReservationCarpoo> reservationCarpoos;
}