package com.ski.speedygobackend.Entity.RecrutementManagement;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.LivraisonStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "livraisons")
public class Livraison implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "livraison_id")
    @JsonProperty("livraisonId")
    Long livraisonId;

    @Column(name = "title", length = 255, nullable = false)
    @JsonProperty("title")
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    String description;

    // Origin and Destination details
    @Column(name = "origin_address", nullable = false)
    @JsonProperty("originAddress")
    String originAddress;

    @Column(name = "destination_address", nullable = false)
    @JsonProperty("destinationAddress")
    String destinationAddress;

    @Column(name = "distance_in_km")
    @JsonProperty("distanceInKm")
    Double distanceInKm;

    // Package details
    @Column(name = "package_weight_kg")
    @JsonProperty("packageWeightKg")
    Double packageWeightKg;

    @Column(name = "requires_refrigeration")
    @JsonProperty("requiresRefrigeration")
    Boolean requiresRefrigeration;

    @Column(name = "package_dimensions")
    @JsonProperty("packageDimensions")
    String packageDimensions; // Format: "length x width x height" in cm

    // Timing
    @Column(name = "scheduled_pickup_time")
    @JsonProperty("scheduledPickupTime")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime scheduledPickupTime;

    @Column(name = "scheduled_delivery_time")
    @JsonProperty("scheduledDeliveryTime")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime scheduledDeliveryTime;

    @Column(name = "actual_delivery_time")
    @JsonProperty("actualDeliveryTime")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime actualDeliveryTime;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @JsonProperty("status")
    LivraisonStatus status;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "assigned_vehicle_id")
    @JsonProperty("assignedVehicle")
    DeliveryVehicle assignedVehicle;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    @JsonProperty("createdBy")
    private User createdBy;

    @Column(name = "created_at")
    @JsonProperty("createdAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = LivraisonStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
