package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Enum.ParcelStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "parcel")
@Getter
@Setter
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "parcel_id")
    private Long parcelId;

    @Column(name = "parcel_name")
    private String parcelName;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "weight")
    private Float weight;

    @ManyToOne
    private Trip trip;

    @ManyToOne
    private InternationalShipping internationalShipping;

    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "parcel_status")
    private ParcelStatus parcelstatus;

    @ManyToMany
    @JoinTable(
            name = "parcel_offres",
            joinColumns = @JoinColumn(name = "parcel_id"),
            inverseJoinColumns = @JoinColumn(name = "offre_id")
    )
    private Set<Offres> offres = new HashSet<>();

}