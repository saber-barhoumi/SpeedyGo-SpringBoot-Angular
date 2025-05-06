package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;

import java.util.List;
import java.util.Optional;

public interface IParcelServices {
    Parcel addParcel(Parcel parcel);
    Parcel updateParcel(Long parcelId, Parcel parcel);
    void deleteParcel(Long parcelId);
    Optional<Parcel> findById(Long parcelId);
    List<Parcel> retrieveAll();
    void changeParcelStatus(Parcel parcel, ParcelStatus status);
    List<Parcel> findByUserId(Long userId);
}