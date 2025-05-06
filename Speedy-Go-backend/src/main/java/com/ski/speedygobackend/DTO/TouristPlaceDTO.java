package com.ski.speedygobackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TouristPlaceDTO {
    private Long id;
    private String name;
    private String governorate;
    private Double rating;
    private String reviews; // Changed from Integer to String
    private Integer reviewsCount; // Added field to store the cleaned numeric value
    private String type;
    private String imageUrl;
    private LocalDateTime createdAt;

    // Constructor without reviewsCount for backward compatibility
    public TouristPlaceDTO(Long id, String name, String governorate, Double rating,
                           String reviews, String type,
                           String imageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.governorate = governorate;
        this.rating = rating;
        this.reviews = reviews;
        this.type = type;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;

        // Calculate reviewsCount from reviews string
        if (reviews != null && !reviews.isEmpty()) {
            try {
                String cleanReviews = reviews.replaceAll("[\\(\\),]", "");
                this.reviewsCount = Integer.parseInt(cleanReviews);
            } catch (NumberFormatException e) {
                this.reviewsCount = 0;
            }
        } else {
            this.reviewsCount = 0;
        }
    }
}