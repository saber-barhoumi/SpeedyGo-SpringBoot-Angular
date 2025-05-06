package com.ski.speedygobackend.Entity.RecrutementManagement;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ski.speedygobackend.Enum.VehicleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "delivery_vehicles")
public class DeliveryVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    @JsonProperty("vehicleId")
    private Long vehicleId;

    @Column(name = "brand")
    @JsonProperty("brand")
    private String brand;

    @Column(name = "model")
    @JsonProperty("model")
    private String model;

    @Column(name = "year_of_manufacture")
    @JsonProperty("yearOfManufacture")
    private Integer yearOfManufacture;

    @Column(name = "license_plate")
    @JsonProperty("licensePlate")
    private String licensePlate;

    @Column(name = "registration_number")
    @JsonProperty("registrationNumber")
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    @JsonProperty("vehicleType")
    private VehicleType vehicleType;

    @Column(name = "max_load_capacity")
    @JsonProperty("maxLoadCapacity")
    private Double maxLoadCapacity;

    @Column(name = "has_refrigeration")
    @JsonProperty("hasRefrigeration")
    private Boolean hasRefrigeration;

    @Column(name = "is_insured")
    @JsonProperty("isInsured")
    private Boolean isInsured;

    @Column(name = "insurance_provider")
    @JsonProperty("insuranceProvider")
    private String insuranceProvider;

    @Column(name = "insurance_policy_number")
    @JsonProperty("insurancePolicyNumber")
    private String insurancePolicyNumber;

    @Column(name = "vehicle_photo_path")
    @JsonProperty("vehiclePhotoPath")
    private String vehiclePhotoPath;

    @OneToOne(mappedBy = "deliveryVehicle")
    @JsonIgnore
    private Recruitment recruitment;
}