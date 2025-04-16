package com.ski.speedygobackend.Controller.OfferManagement;


import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.OfferManagement.pointfidelite;
import com.ski.speedygobackend.Service.OfferManagement.IOffresServices;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.ski.speedygobackend.DTO.FideliteDTO;
import com.ski.speedygobackend.DTO.offresDetailsDTO;


@RequiredArgsConstructor
@RestController
@RequestMapping("/offres")

public class OffresRestController {

    private final IOffresServices offresServices;

    @PostMapping("/add/{id-store}")
    public ResponseEntity<?> addOffre(@RequestBody Offres offre , @PathVariable("id-store") Long idStore) {
        System.out.println(idStore);

        try {
            // Ensure the store is set before saving the offer
            if (idStore != null) {

                Offres savedOffre = offresServices.addOffre(offre,idStore);
                return new ResponseEntity<>(savedOffre, HttpStatus.OK);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Store ID is required");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // You might want to add other endpoints for the rest of your service methods
    @GetMapping("/all/{id-store}")
    public ResponseEntity<List<offresDetailsDTO>> getAllOffresByStoreId (@PathVariable("id-store") Long idStore) {
        List<offresDetailsDTO> offres = offresServices.retrieveAllOffresByStoreID(idStore);
        // List<offresDetailsDTO> offres = offresServices.retrieveAllOffres();
        return ResponseEntity.ok(offres);
    }

    @GetMapping("getby/{id}")
    public ResponseEntity<Offres> getOffreById(@PathVariable("id") Long idOffre) {
        Offres offre = offresServices.retrieveOffre(idOffre);
        return offre != null ? ResponseEntity.ok(offre) : ResponseEntity.notFound().build();
    }

    @PutMapping("/update")
    public ResponseEntity<Offres> updateOffre(@RequestBody Offres offre) {
        Offres updatedOffre = offresServices.updateOffre(offre);
        return ResponseEntity.ok(updatedOffre);
    }
    @PostMapping("/Add-fidelite/{id-store}/{id}")
    public   ResponseEntity<Integer> addFidelite(@PathVariable("id-store") Long idOffre, @PathVariable("id") Long id) {
        Integer updatedOffre = offresServices.addFidelite(idOffre, id);
        return ResponseEntity.ok(updatedOffre);
    }
    @GetMapping("/all-fidelite/{id}")
    public ResponseEntity<?> getAllFidelite(@PathVariable("id") Long id) {
        try {
            List<FideliteDTO> fideliteList = offresServices.retrieveAllFideliteCart(id);
            return ResponseEntity.ok(fideliteList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des points de fidélité: " + e.getMessage());
        }
    }

    // Keep the existing endpoint with store ID for backward compatibility
    @GetMapping("/all-fidelite/{id-store}/{id}")
    public ResponseEntity<?> getAllFideliteByStore(@PathVariable("id-store") Long idStore, @PathVariable("id") Long id) {
        try {
            List<FideliteDTO> fideliteList = offresServices.retrieveAllFideliteCart(id);
            // Filter by store if needed
            if (idStore != null && idStore > 0) {
                fideliteList = fideliteList.stream()
                        .filter(fidelite -> fidelite.getStoreName() != null &&
                                !fidelite.getStoreName().isEmpty())
                        .toList();
            }
            return ResponseEntity.ok(fideliteList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des points de fidélité: " + e.getMessage());
        }
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteOffre(@PathVariable("id") Long idOffre) {
        offresServices.removeOffre(idOffre);
        return ResponseEntity.noContent().build();
    }
}