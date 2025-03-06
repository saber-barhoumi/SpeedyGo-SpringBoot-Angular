package com.ski.speedygobackend.Entity.SpecificTripManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.ReservationStatus;
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
public class Reservation implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reservationID;
    LocalDateTime reservationDate;

    @Enumerated(EnumType.STRING)
    ReservationStatus reservationStatus;
    @ManyToOne
    private User user;
    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL)
    private SpecifiqueTrip specifiqueTrip;



}