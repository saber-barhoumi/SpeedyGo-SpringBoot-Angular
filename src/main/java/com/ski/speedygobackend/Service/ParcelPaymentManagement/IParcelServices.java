package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;

import java.util.List;
import java.util.Optional;

public interface IParcelServices {
    Parcel addParcel(Parcel parcel);
    Parcel retrieveParcel(Long parcelId);
    List<Parcel> retrieveAll();
    void deleteParcel(Long parcelId);
    Parcel updateParcel(Long parcelId, Parcel parcel);
    Optional<Parcel> findById(Long parcelId);
    Parcel save(Parcel parcel);
    Parcel changeParcelStatus(Parcel parcel, ParcelStatus newStatus);

}
