package com.ski.speedygobackend.Entity.SpecificTripManagement;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ski.speedygobackend.Enum.ParcelType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class SpecifiqueTrip implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("tripDetails")
    private String tripDetails;

    @JsonProperty("departureLocation")
    private String departureLocation;
    @JsonProperty("arrivalLocation")
    private String arrivalLocation;
    @JsonProperty("size")
    private double size;


    @JsonProperty("description")
    private String description;


    @JsonProperty("departureDate")
    private LocalDate departureDate;
    @JsonProperty("arrivalDate")
    private LocalDate arrivalDate;

    @JsonProperty("departureTime")
    private String departureTime;

    @JsonProperty("arrivalTime")
    private String arrivalTime;


    @Enumerated(EnumType.STRING)
    @JsonProperty("parcelType")
    private ParcelType parcelType;

    @JsonProperty("receiverFullName")
    private String receiverFullName;

    @JsonProperty("receiverPhoneNumber")
    private String receiverPhoneNumber;

    @JsonProperty("parcelDescription")
    private String parcelDescription;

    @JsonProperty("parcelHeight")
    private double parcelHeight;

    @JsonProperty("parcelWidth")
    private double parcelWidth;

    @JsonProperty("parcelLength")
    private double parcelLength;
    @JsonProperty("passThroughLocation")
    private String passThroughLocation;

    @JsonProperty("photo")
    private String photo;

    public void setPhoto(String photo) {
        this.photo = photo;
    }
    @OneToOne
    private Reservation reservation;
}
