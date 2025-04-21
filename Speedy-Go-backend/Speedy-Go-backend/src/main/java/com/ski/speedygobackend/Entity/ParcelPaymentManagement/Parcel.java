package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Enum.ParcelStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class Parcel implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parcelId;
    private String parcelName;
    private String deliveryAdress;
    private String currentLocation;
    private float weight;

    @Enumerated(EnumType.STRING)
    ParcelStatus parcelstatus;
    @ManyToOne
    private Trip trip;
    @ManyToOne
    private Offres offre;
}
