package com.ski.speedygobackend.Entity.CarpoolingManagement;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ski.speedygobackend.Entity.UserManagement.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "carpooling_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarpoolingReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @JsonBackReference
    private ReservationCarpoo reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "review_text", length = 1000)
    private String reviewText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Convenience method to get carpooling from reservation
    public Carpooling getCarpooling() {
        return this.reservation != null ? this.reservation.getCarpooling() : null;
    }
}