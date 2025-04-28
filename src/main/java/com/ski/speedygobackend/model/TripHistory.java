package com.ski.speedygobackend.model;

import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import com.ski.speedygobackend.Enum.TrafficLevel;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromLabel;
    private String toLabel;

    @Embedded
    private Coordinates startCoordinates;

    @Embedded
    private Coordinates endCoordinates;

    private double distanceKm;
    private double estimatedDurationMin;
    private double realDurationMin;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private TrafficLevel trafficLevel;

    private String dayOfWeek;

    @ManyToOne
    private SmartRoute routeUsed;

    // Méthode pour calculer l'écart par rapport à l'estimation
    public double getDurationDeviation() {
        return realDurationMin - estimatedDurationMin;
    }
}

