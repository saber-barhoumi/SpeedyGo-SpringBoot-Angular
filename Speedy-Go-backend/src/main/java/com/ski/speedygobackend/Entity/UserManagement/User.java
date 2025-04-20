package com.ski.speedygobackend.Entity.UserManagement;

import com.ski.speedygobackend.Entity.ChatbotManagement.SpeedyChat;
import com.ski.speedygobackend.Entity.ComfirmationTransfert;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "users") // Added to prevent naming conflicts
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long UserId;

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    @Column(name = "birth_date")
    LocalDate birthDate;

    @Column(name = "email", unique = true)
    String email;

    @Column(name = "password")
    String password;

    @Column(name = "phone_number")
    String phoneNumber;

    @Column(name = "address")
    String address;

    @Lob
    @Column(name = "profile_picture")
    byte[] profilePicture;
    @Column(name = "profile_picture_type")
    private String profilePictureType;
    @Enumerated(EnumType.STRING)
    @Column(name = "sexe")
    Sexe sexe;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    Role role;
    @Column(name = "password_reset_token")
    private String passwordResetToken;

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

    @ManyToMany(mappedBy = "users", cascade = CascadeType.ALL)
    private Set<ChatRoom> chatRooms;


}