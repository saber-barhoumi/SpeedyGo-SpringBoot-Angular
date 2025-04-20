package com.ski.speedygobackend.Service.ParcelPaymentManagement;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Repository.IParcelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
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
    public Parcel updateParcel(Long parcelId, Parcel updatedParcel) {
        // Recherche de l'entité Parcel existante dans la base de données
        Parcel existingParcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new RuntimeException("Colis introuvable avec l'ID : " + parcelId));

        // Mise à jour des champs du colis
        existingParcel.setParcelName(updatedParcel.getParcelName());  // Exemple de mise à jour pour le nom du colis
        existingParcel.setWeight(updatedParcel.getWeight());  // Mise à jour du poids, etc.
        existingParcel.setDeliveryAddress(updatedParcel.getDeliveryAddress());  // Mise à jour de l'adresse, etc.

        // Assurez-vous que d'autres champs sont correctement mis à jour ici si nécessaire

        return parcelRepository.save(existingParcel);
    }

    @Override
    public Parcel updateParcel(Parcel parcel) {
        // Vérification si l'ID est valide et si le colis existe
        if (parcel.getParcelId() == null || !parcelRepository.existsById(parcel.getParcelId())) {
            throw new RuntimeException("Impossible de mettre à jour : ID du colis manquant ou invalide.");
        }

        // Sauvegarde du colis mis à jour
        return parcelRepository.save(parcel);
    }
}
