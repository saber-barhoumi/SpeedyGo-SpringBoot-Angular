package com.ski.speedygobackend.Entity.OfferManagement;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "pointfidelite")
public class pointfidelite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int points;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "last_used", nullable = true)
    private LocalDateTime lastUsed;

}
