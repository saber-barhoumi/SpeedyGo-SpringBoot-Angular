package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Repository.IParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ParcelServicesImpl implements IParcelServices {
    private final IParcelRepository parcelRepository;
    @Override
    public Parcel addParcel(Parcel parcel) {
        return parcelRepository.save(parcel);
    }
    @Override
    public Parcel retrieveParcel(Long parcelId) {
        return parcelRepository.findById(parcelId).orElse(null);
    }
    @Override
    public List<Parcel> retrieveAll() {
        return (List<Parcel>) parcelRepository.findAll();
    }

    @Override
    public void deleteParcel(Long parcelId) {
        parcelRepository.deleteById(parcelId);
    }

    @Override
    public Parcel updateParcel(Parcel parcel) {
        return parcelRepository.save(parcel);
    }
}
