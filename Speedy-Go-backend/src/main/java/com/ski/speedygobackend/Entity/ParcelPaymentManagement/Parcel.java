package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.ReturnManagment.Returns;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import com.ski.speedygobackend.Enum.ParcelStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Parcel implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parcelId;

    private String parcelName;
    private String deliveryAddress;
    private String currentLocation;
    private float weight;

    @Enumerated(EnumType.STRING)
    ParcelStatus parcelStatus;

    @ManyToOne
    private Trip trip;

    @ManyToOne
    private Offres offre;


    @ManyToOne
    private InternationalShipping internationalShipping;

}
