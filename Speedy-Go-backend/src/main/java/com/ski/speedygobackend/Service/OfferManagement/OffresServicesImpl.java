package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.OfferManagement.Store;
import com.ski.speedygobackend.Entity.OfferManagement.pointfidelite;
import com.ski.speedygobackend.Repository.FideliteRepository;
import com.ski.speedygobackend.Repository.IOffresRepository;
import com.ski.speedygobackend.Repository.IStoreRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ski.speedygobackend.DTO.FideliteDTO;
import com.ski.speedygobackend.DTO.offresDetailsDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class OffresServicesImpl implements IOffresServices {

    private final IOffresRepository offresRepository;
    private final IStoreRepository storeRepository;
    private final FideliteRepository fideliteRepository;

    @Override
    @Transactional
    public Offres addOffre(Offres offre,Long idStore) {
        if (offre.getTitle() == null || offre.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Offer title cannot be empty");
        }

        if (idStore != null) {
            Store store = storeRepository.findById(idStore)
                    .orElseThrow(() -> new IllegalArgumentException("Store with ID " + idStore + " does not exist"));
            offre.setStore(store);
        }

        if (offre.getDiscount() < 0 || offre.getDiscount() > 100) {
            throw new IllegalArgumentException("Discount must be between 0 and 100");
        }

        Store store = offre.getStore();
        if (!storeRepository.existsById(store.getStoreID())) {
            throw new IllegalArgumentException("Store with ID " + store.getStoreID() + " does not exist");
        }

        return offresRepository.save(offre);
    }

    @Override
    public List<offresDetailsDTO> retrieveAllOffres() {
        return offresRepository.findAll().stream().map(offre -> new offresDetailsDTO(
                offre.getOffreId(),
                offre.getTitle(),
                offre.getDescription(),
                offre.getDiscount(),
                offre.getImage(),
                offre.getPrice(),
                offre.isAvailable(),
                offre.getCategory(),
                offre.getDateStart(),
                offre.getStore().getName()
        )).collect(Collectors.toList());
    }

    @Override
    public Offres retrieveOffre(Long offreId) {
        return offresRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable avec l'ID : " + offreId));
    }

    @Override
    @Transactional
    public void removeOffre(Long offreId) {
        if (!offresRepository.existsById(offreId)) {
            throw new RuntimeException("Impossible de supprimer une offre inexistante avec l'ID : " + offreId);
        }
        offresRepository.deleteById(offreId);
    }

    @Override
    @Transactional
    public Offres updateOffre(Offres offre) {
        if (offre.getOffreId() == null) {
            throw new IllegalArgumentException("L'ID de l'offre ne doit pas être nul pour l'opération de mise à jour");
        }

        if (!offresRepository.existsById(offre.getOffreId())) {
            throw new RuntimeException("Impossible de mettre à jour une offre inexistante avec l'ID : " + offre.getOffreId());
        }

        return offresRepository.save(offre);
    }

    @Override
    public List<offresDetailsDTO> retrieveAllOffresByStoreID(Long idStore) {
        return offresRepository.findByStore_StoreID(idStore).stream().map(offre -> new offresDetailsDTO(
                offre.getOffreId(),
                offre.getTitle(),
                offre.getDescription(),
                offre.getDiscount(),
                offre.getImage(),
                offre.getPrice(),
                offre.isAvailable(),
                offre.getCategory(),
                offre.getDateStart(),
                offre.getStore().getName()
        )).collect(Collectors.toList());
    }

    @Override
    public Integer addFidelite(Long idStore, Long userId) {
        Store store = storeRepository.findById(idStore)
                .orElseThrow(() -> new IllegalArgumentException("Le magasin avec l'ID " + idStore + " n'existe pas"));

        pointfidelite fidelite = fideliteRepository.findByStore_StoreIDAndUserId(idStore, userId)
                .orElse(new pointfidelite());

        fidelite.setUserId(userId);
        fidelite.setStore(store);
        fidelite.setPoints(fidelite.getPoints() + 10);
        fidelite.setLastUsed(LocalDateTime.now());

        fideliteRepository.save(fidelite);

        return fidelite.getPoints();
    }

    @Override
    public List<FideliteDTO> retrieveAllFideliteCart(Long id) {
        return fideliteRepository.findByUserId(id).stream().map(fidelite -> {
            FideliteDTO dto = new FideliteDTO();
            dto.setId(fidelite.getId());
            dto.setUserId(fidelite.getUserId());
            dto.setPoints(fidelite.getPoints());
            dto.setStoreName(fidelite.getStore() != null ? fidelite.getStore().getName() : "");
            dto.setLastUsed(fidelite.getLastUsed());
            return dto;
        }).collect(Collectors.toList());
    }


}
