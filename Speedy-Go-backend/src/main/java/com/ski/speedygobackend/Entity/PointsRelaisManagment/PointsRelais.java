package com.ski.speedygobackend.Entity.PointsRelaisManagment;

import com.ski.speedygobackend.Entity.ComfirmationTransfert;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PointsRelais {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Identifiant du point relais


    private Double latitude;  // Latitude du point relais
    private Double longitude;  // Longitude du point relais
    private Double capacite;


}
