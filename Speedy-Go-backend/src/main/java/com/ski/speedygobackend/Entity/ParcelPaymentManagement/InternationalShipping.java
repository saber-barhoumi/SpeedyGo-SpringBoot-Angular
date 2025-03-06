package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import com.ski.speedygobackend.Enum.ShippingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class InternationalShipping implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Colonne DB : id

    private String originCountry;
    private String destinationCountry;
    private Double shippingCost;
    private String trackingNumber;



    private LocalDate shippingDate;
    private LocalDate estimatedDeliveryDate;

    @Enumerated(EnumType.STRING)
    private ShippingStatus shippingStatus;

    // Relation OneToMany avec Parcel
    @OneToMany(mappedBy = "internationalShipping", cascade = CascadeType.ALL)
    private List<Parcel> parcels = new ArrayList<>();
}