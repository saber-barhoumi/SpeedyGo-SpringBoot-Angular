package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Repository.IParcelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParcelServicesImpl implements IParcelServices {

    private final IParcelRepository parcelRepository;
    private final ParcelStatusPublisher statusPublisher;

    @Autowired
    public ParcelServicesImpl(IParcelRepository parcelRepository, ParcelStatusPublisher statusPublisher) {
        this.parcelRepository = parcelRepository;
        this.statusPublisher = statusPublisher;
    }

    @Override
    public Parcel addParcel(Parcel parcel) {
        Parcel savedParcel = parcelRepository.save(parcel);
        statusPublisher.notifyStatusChange(savedParcel.getParcelId(), savedParcel.getParcelstatus());
        return savedParcel;
    }

    @Override
    public Parcel updateParcel(Long parcelId, Parcel parcel) {
        Optional<Parcel> existingParcelOpt = parcelRepository.findById(parcelId);
        if (existingParcelOpt.isPresent()) {
            Parcel existingParcel = existingParcelOpt.get();
            existingParcel.setParcelName(parcel.getParcelName());
            existingParcel.setDeliveryAddress(parcel.getDeliveryAddress());
            existingParcel.setCurrentLocation(parcel.getCurrentLocation());
            existingParcel.setWeight(parcel.getWeight());
            existingParcel.setTrip(parcel.getTrip());
            existingParcel.setInternationalShipping(parcel.getInternationalShipping());
            existingParcel.setUserId(parcel.getUserId());
            existingParcel.setParcelstatus(parcel.getParcelstatus());
            return parcelRepository.save(existingParcel);
        }
        return null;
    }

    @Override
    public void deleteParcel(Long parcelId) {
        parcelRepository.deleteById(parcelId);
    }

    @Override
    public Optional<Parcel> findById(Long parcelId) {
        return parcelRepository.findById(parcelId);
    }

    @Override
    public List<Parcel> retrieveAll() {
        return parcelRepository.findAll();
    }

    @Override
    public void changeParcelStatus(Parcel parcel, ParcelStatus status) {
        parcel.setParcelstatus(status);
        Parcel updatedParcel = parcelRepository.save(parcel);
        statusPublisher.notifyStatusChange(updatedParcel.getParcelId(), status);
    }

    @Override
    public List<Parcel> findByUserId(Long userId) {
        return parcelRepository.findByUserId(userId);
    }
}