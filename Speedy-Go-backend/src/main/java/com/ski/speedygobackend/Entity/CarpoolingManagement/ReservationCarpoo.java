package com.ski.speedygobackend.Entity.CarpoolingManagement;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "reservationCarpoo")
public class ReservationCarpoo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @ManyToOne
    @JoinColumn(name = "carpooling_id")
    @JsonBackReference

    private Carpooling carpooling;

    @Column(name = "user_id")
    private Long userId;

    // You can add more fields like reservationDate, etc.
}