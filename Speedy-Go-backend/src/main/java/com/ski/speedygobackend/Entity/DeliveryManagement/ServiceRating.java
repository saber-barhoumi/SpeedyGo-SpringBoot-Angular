package com.ski.speedygobackend.Entity.DeliveryManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "service_ratings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "service_id"}))
public class ServiceRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private DeliveryService service;

    @Column(nullable = false)
    private Double rating;

    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Method to create a new rating
    public static ServiceRating createRating(User user, DeliveryService service, Double rating) {
        ServiceRating serviceRating = new ServiceRating();
        serviceRating.setUser(user);
        serviceRating.setService(service);
        serviceRating.setRating(rating);
        serviceRating.setCreatedAt(LocalDateTime.now());
        serviceRating.setUpdatedAt(LocalDateTime.now());
        return serviceRating;
    }

    // Method to update an existing rating
    public void updateRating(Double rating) {
        this.rating = rating;
        this.updatedAt = LocalDateTime.now();
    }
}