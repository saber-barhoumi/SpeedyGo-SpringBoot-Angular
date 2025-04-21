package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;

import java.util.List;

public interface IParcelServices {
    Parcel addParcel(Parcel parcel);
    Parcel retrieveParcel(Long parcelId);
    List<Parcel> retrieveAll();
    void deleteParcel(Long parcelId);
    Parcel updateParcel(Parcel parcel);
}
