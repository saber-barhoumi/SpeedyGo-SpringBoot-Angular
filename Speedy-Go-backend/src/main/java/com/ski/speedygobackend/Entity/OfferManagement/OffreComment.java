package com.ski.speedygobackend.Entity.OfferManagement;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class OffreComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    @ManyToOne
    @JoinColumn(name = "offre_id", nullable = false)
    private Offres offre;

    private LocalDateTime createdAt;

    private Boolean badWord;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}