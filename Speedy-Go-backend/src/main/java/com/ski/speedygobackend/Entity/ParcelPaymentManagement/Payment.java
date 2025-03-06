package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import com.ski.speedygobackend.Enum.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Payment implements Serializable  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;
    private Date paymentDate;
    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;


    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL)
    private List<Invoice> invoices;

}
