package com.ski.speedygobackend.Entity.ReturnManagment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RetourStatus;
import com.ski.speedygobackend.Enum.RetourType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;



import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)

@Entity
public class Returns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long returnID;

    @Enumerated(EnumType.STRING)
    RetourStatus retourstatus;

    private String reason_description;

    @Enumerated(EnumType.STRING)
    RetourType retourtype;


    private LocalDate retourdate;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    public void prePersist() {
        if (retourstatus == null) {
            retourstatus = RetourStatus.PENDING;
        }
    }
}

