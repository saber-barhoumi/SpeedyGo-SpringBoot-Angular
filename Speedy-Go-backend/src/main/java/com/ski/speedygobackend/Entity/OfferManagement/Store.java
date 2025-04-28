package com.ski.speedygobackend.Entity.OfferManagement;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.StoreStatus;
import com.ski.speedygobackend.Enum.StoreType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;
import java.time.LocalTime;
import java.util.Set;


@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level=AccessLevel.PRIVATE)
@Entity
public class Store  implements Serializable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long storeID;
  String name;
  String opening;
  String closing;
  String logo;
  String website;
  String image;
  String address;
  String city;
  String location;
  String description;
  String phone;
  String email;

  @Enumerated(EnumType.STRING)
  @JsonProperty("storeType")
  private StoreType storeType;

  @Enumerated(EnumType.STRING)
  @JsonProperty("storeStatus")
  private StoreStatus storeStatus;


  @ManyToOne
  private User user;
  @OneToMany(mappedBy = "store")
  private Set<Offres> offres;
}
