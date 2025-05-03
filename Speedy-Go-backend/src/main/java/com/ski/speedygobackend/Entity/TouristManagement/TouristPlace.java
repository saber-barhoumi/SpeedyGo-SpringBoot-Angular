package com.ski.speedygobackend.Entity.TouristManagement;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tourist_places")
public class TouristPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String governorate;

    private Double rating;

    @Column(length = 100)
    private String reviews;

    private String type;

    private String url;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Helper method to get the numeric value of reviews
    public Integer getReviewsCount() {
        if (reviews == null || reviews.isEmpty()) {
            return 0;
        }

        try {
            // Remove parentheses and commas to parse as integer
            String cleanReviews = reviews.replaceAll("[\\(\\),]", "");
            return Integer.parseInt(cleanReviews);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}