package com.ski.speedygobackend.DTO;

import java.time.LocalTime;

import com.ski.speedygobackend.Enum.StoreStatus;
import com.ski.speedygobackend.Enum.StoreType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StoreDetailsDTO {
    private Long storeID;
    private String name;
    private String opening;
    private String closing;
    private String logo;
    private String website;
    private String image;
    private String address;
    private String city;
    private String location;
    private String description;
    private String phone;
    private String email;
    private StoreType storeType;
    private StoreStatus storeStatus;

    public void setImage(String image) {
        this.image = image;
    }
}



