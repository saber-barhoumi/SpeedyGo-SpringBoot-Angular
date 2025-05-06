package com.ski.speedygobackend.Entity.ParcelPaymentManagement;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class InvoiceItem implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long invoiceItemId;

  Long offerId;

  String offerTitle;

  double price;

  double discount;

  int quantity;

  @ManyToOne
  Invoice invoice;

}
