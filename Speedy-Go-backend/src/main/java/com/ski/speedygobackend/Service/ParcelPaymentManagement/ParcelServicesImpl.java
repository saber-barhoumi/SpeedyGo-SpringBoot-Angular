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
    private final ParcelStatusPublisher parcelStatusPublisher;

    @Autowired
    public ParcelServicesImpl(IParcelRepository parcelRepository, ParcelStatusPublisher parcelStatusPublisher) {
        this.parcelRepository = parcelRepository;
        this.parcelStatusPublisher = parcelStatusPublisher;
    }

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
    public Parcel updateParcel(Long parcelId, Parcel parcel) {
        Parcel existingParcel = parcelRepository.findById(parcelId).orElse(null);
        if (existingParcel == null) return null;

        existingParcel.setParcelstatus(parcel.getParcelstatus());
        // ici on pourrait copier d'autres champs si besoin

        return changeParcelStatus(existingParcel, parcel.getParcelstatus());
    }

    @Override
    public Parcel save(Parcel parcel) {
        return parcelRepository.save(parcel);
    }

    @Override
    public Optional<Parcel> findById(Long parcelId) {
        return parcelRepository.findById(parcelId);
    }

    // ✅ MÉTHODE CENTRALE : pour changer le statut + envoyer WebSocket
    public Parcel changeParcelStatus(Parcel parcel, ParcelStatus newStatus) {
        parcel.setParcelstatus(newStatus);
        Parcel saved = parcelRepository.save(parcel);
        parcelStatusPublisher.notifyStatusChange(parcel.getParcelId(), newStatus);
        return saved;
    }
}
