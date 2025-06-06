package com.ski.speedygobackend.Entity.TripManagement;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Entity.FeedbackManagement.FeedbackAnalysis;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import com.ski.speedygobackend.Enum.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Trip implements Serializable {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tripDate;
    private String description;
    private String startLocation;
    private String endLocation;
    private String phoneNumber;
    @Enumerated(EnumType.STRING)
    TripStatus  tripStatus;



    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL)
    private List<Parcel> parcels;





    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL)
    private FeedbackAnalysis feedbackAnalysis;

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL )
    private SmartRoute smartRoute;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles;


}