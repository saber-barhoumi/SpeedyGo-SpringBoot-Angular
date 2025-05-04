package com.ski.speedygobackend.Entity.UserManagement;

import com.ski.speedygobackend.Entity.ChatbotManagement.SpeedyChat;
import com.ski.speedygobackend.Entity.CommunicationManagement.ChatRoom;
import com.ski.speedygobackend.Entity.LoyaltyManagement.LoyaltyCard;
import com.ski.speedygobackend.Entity.OfferManagement.Store;
import com.ski.speedygobackend.Entity.ReportManagement.Report;
import com.ski.speedygobackend.Entity.SpecificTripManagement.Reservation;
import com.ski.speedygobackend.Enum.Role;
import com.ski.speedygobackend.Enum.Sexe;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long UserId;
    private String firstName;
    private String lastName;
    private String birthDate;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private String profilePicture;



    @Enumerated(EnumType.STRING)
    Sexe sexe;
    @Enumerated(EnumType.STRING)
    Role role;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<SpeedyChat> speedyChats;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Store> stores;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Report> reports;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private LoyaltyCard loyaltyCard;
    @OneToMany(mappedBy = "user")
    private Set<Reservation> reservations;

    @ManyToMany (mappedBy = "users", cascade = CascadeType.ALL)
    private Set<ChatRoom> chatRooms;
}
