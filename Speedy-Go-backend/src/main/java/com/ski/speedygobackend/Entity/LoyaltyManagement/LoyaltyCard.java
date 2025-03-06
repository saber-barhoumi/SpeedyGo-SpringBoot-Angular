package com.ski.speedygobackend.Entity.LoyaltyManagement;

import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.LoyaltyStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class LoyaltyCard implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long loyaltyCardID;
    String titleCard;
    LocalDate issuanceDate;
    LocalDate expirationDate;
    double pointsBalance;
    String description;
    @Enumerated(EnumType.STRING)
    LoyaltyStatus loyaltyStatus ; ;
    @OneToOne(cascade = CascadeType.ALL)

    private User user;

}

