package com.ski.speedygobackend.Entity.RouteManagement;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class SmartRoute implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String routeName;
    private double distance;
    private String routeDetails;
    private String starLocation;
    private String endLocation;
    private Date estmatedTime;

    @OneToOne
    private Trip trip;

}
