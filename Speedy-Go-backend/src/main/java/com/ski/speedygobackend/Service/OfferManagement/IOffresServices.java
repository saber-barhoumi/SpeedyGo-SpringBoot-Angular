package com.ski.speedygobackend.Service.OfferManagement;

import com.ski.speedygobackend.DTO.FideliteDTO;
import com.ski.speedygobackend.DTO.offresDetailsDTO;
import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.OfferManagement.pointfidelite;

import java.util.List;

public interface IOffresServices {

    Offres addOffre(Offres offre , Long idStore);
    List<offresDetailsDTO> retrieveAllOffres();
    Offres retrieveOffre(Long idOffre);
    void removeOffre(Long idOffre);
    Offres updateOffre(Offres offre);
    List<offresDetailsDTO> retrieveAllOffresByStoreID(Long idStore);
    Integer addFidelite(Long idStore, Long userId);
    List<FideliteDTO> retrieveAllFideliteCart(Long id);
}
