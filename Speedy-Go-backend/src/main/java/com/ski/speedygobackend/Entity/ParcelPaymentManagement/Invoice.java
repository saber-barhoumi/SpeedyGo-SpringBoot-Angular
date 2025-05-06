package com.ski.speedygobackend.Entity.ParcelPaymentManagement;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Invoice implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long invoiceId;

    String invoiceNumber;

    double totalAmount;

    LocalDate issueDate;

    LocalDate dueDate;

    @ManyToOne
    Payment payment;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    List<InvoiceItem> invoiceItems;

}
