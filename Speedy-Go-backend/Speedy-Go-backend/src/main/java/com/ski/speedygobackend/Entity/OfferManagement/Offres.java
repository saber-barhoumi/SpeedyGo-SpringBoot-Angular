package com.ski.speedygobackend.Entity.OfferManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class Offres {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long offreId;
    private String title;
    private String description;
    private double discount;
    private String image;
    private double price;
    private boolean isAvailable;
    private String category;
    private String dateStart;



    @ManyToOne
    private Store store;
    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL)
    private List<Parcel> parcels;
}
