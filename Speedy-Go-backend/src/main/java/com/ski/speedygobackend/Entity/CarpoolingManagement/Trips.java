package com.ski.speedygobackend.Entity.CarpoolingManagement;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "trips")
public class Trips {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "departure_city")
    private String departureCity;

    @Column(name = "arrival_city")
    private String arrivalCity;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "fuel_type")
    private String fuelType;

    private Double price;

    private Integer wifi;

    @Column(name = "air_conditioning")
    private Integer airConditioning;

    @Column(name = "weather_type")
    private String weatherType;
}