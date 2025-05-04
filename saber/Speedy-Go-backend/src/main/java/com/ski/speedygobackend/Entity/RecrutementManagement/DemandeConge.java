package com.ski.speedygobackend.Entity.RecrutementManagement;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DemandeConge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private CongeStatus status; // PENDING, ACCEPTED, REJECTED

    @ManyToOne
    private DeliveryVehicle deliveryVehicle; // مربوطة بـ DeliveryVehicle
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public CongeStatus getStatus() {
        return status;
    }

    public void setStatus(CongeStatus status) {
        this.status = status;
    }

    public DeliveryVehicle getDeliveryVehicle() {
        return deliveryVehicle;
    }

    public void setDeliveryVehicle(DeliveryVehicle deliveryVehicle) {
        this.deliveryVehicle = deliveryVehicle;
    }
}

