package com.ski.speedygobackend.Entity.ReturnManagment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
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

    @ManyToOne
    Parcel parcel;

    private LocalDate retourdate;
}
