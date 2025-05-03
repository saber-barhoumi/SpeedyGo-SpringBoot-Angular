package com.ski.speedygobackend.DTO;

import com.ski.speedygobackend.Entity.CarpoolingManagement.Carpooling;
import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Entity.FeedbackManagement.FeedbackAnalysis;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import com.ski.speedygobackend.Enum.TripStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class tripsDetailsDTO implements Serializable {
    private Long id;
    private String tripDate;
    private String destination;
    private TripStatus tripStatus;
    private List<Parcel> parcels;
    private List<Carpooling> carpoolings;
    private List<CarbonFootPrint> carbonFootprints;
    private FeedbackAnalysis feedbackAnalysis;
    private SmartRoute smartRoute;
    private List<Vehicle> vehicles;
    private String startLocation;
    private String endLocation;

}
