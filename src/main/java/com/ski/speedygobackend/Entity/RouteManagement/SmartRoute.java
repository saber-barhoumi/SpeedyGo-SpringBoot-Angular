package com.ski.speedygobackend.Entity.RouteManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Enum.TrafficLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class SmartRoute implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String routeName;

    double distance; // en mètres

    @Column(columnDefinition = "TEXT")
    String routeDetails; // JSON brut du trajet

    String startLocation;
    String endLocation;

    Duration estimatedTime;

    @Column(columnDefinition = "TEXT")
    String alternativeRoutes; // Stockage des alternatives JSON

    LocalDateTime calculationDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    TrafficLevel trafficLevel; // Enum: LOW, MEDIUM, HIGH

    private Double trafficConfidence;

    double fuelEstimate; // Estimation de carburant consommé

    @OneToOne
    Trip trip;

    // Méthode pour extraire les points clés du trajet
    @Transient
    public Map<String, Object> getRouteSummary() {
        return Map.of(
                "distance", distance,
                "duration", estimatedTime.toMinutes(),
                "trafficLevel", trafficLevel.toString()
        );
    }
}

