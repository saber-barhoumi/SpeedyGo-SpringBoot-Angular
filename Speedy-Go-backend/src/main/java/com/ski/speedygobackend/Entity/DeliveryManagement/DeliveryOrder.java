package com.ski.speedygobackend.Entity.DeliveryManagement;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity

public class DeliveryOrder implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long orderId;

    Long deliveryPersonId;
    String destinationCountry;
    String destinationAddress;
    Double weight;
    String itemDescription;

    @Lob
    @Column(name = "item_photo")
    byte[] itemPhoto;

    @Column(name = "item_photo_type")
    String itemPhotoType;

    LocalDateTime orderDate;
    LocalDateTime estimatedDeliveryDate;
    LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    OrderStatus status;

    Double totalPrice;

    String statusReason; // Used for rejection, cancellation, or other status reasons
    @Column
    private Double rating;

    @ManyToOne
    @JoinColumn(name = "service_id")
    @JsonBackReference("deliveryService-deliveryOrder")
    DeliveryService deliveryService;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonBackReference("customer-deliveryOrder")
    User customer;

    @OneToOne
    @JoinColumn(name = "parcel_id")
    Parcel parcel;


    // Add new timestamp fields
    LocalDateTime pickedUpAt;     // When the order is picked up
    LocalDateTime inTransitAt;    // When the order starts its journey
    LocalDateTime deliveredAt;    // When the order is successfully delivered
    LocalDateTime canceledAt;     // When the order is canceled
    LocalDateTime rejectedAt;     // When the order is rejected

}