package com.ski.speedygobackend.DTO;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.InternationalShipping;
import com.ski.speedygobackend.Entity.TripManagement.Trip;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParcelDTO {
    private Long parcelId;
    private String parcelName;
    private String deliveryAddress;
    private String currentLocation;
    private Float weight;
    private Trip trip;
    private InternationalShipping internationalShipping;
    private Long userId;
    private String parcelstatus;
}