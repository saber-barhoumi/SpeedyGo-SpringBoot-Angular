package com.ski.speedygobackend.Entity.DeliveryManagement;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.DeliveryType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity

public class DeliveryService implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long serviceId;


    @Enumerated(EnumType.STRING)
    DeliveryType deliveryType; // LOCAL or INTERNATIONAL

    // For international delivery
    @ElementCollection
    @CollectionTable(name = "delivery_countries", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "country")
    Set<String> countriesServed = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "accepted_goods", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "good_type")
    Set<String> acceptedGoodTypes = new HashSet<>();

    // Service conditions
    Double maxWeightPerOrder;
    Integer maxOrdersPerDay;
    Double basePrice;
    Double pricePerKg;

    Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("deliveryPerson-deliveryService")
    User deliveryPerson;


    @OneToMany(mappedBy = "deliveryService", cascade = CascadeType.ALL)
    @JsonManagedReference("deliveryService-deliveryOrder")
    List<DeliveryOrder> orders = new ArrayList<>();


}