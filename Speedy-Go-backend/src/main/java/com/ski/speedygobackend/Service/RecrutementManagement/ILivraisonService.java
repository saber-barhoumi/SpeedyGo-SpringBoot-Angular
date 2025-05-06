package com.ski.speedygobackend.Service.RecrutementManagement;
import com.ski.speedygobackend.Entity.RecrutementManagement.Livraison;
import com.ski.speedygobackend.Enum.LivraisonStatus;

import java.util.List;
import java.util.Map;

public interface ILivraisonService {
    List<Livraison> getAllLivraisons();
    Livraison getLivraisonById(Long id);
    Livraison createLivraison(Livraison livraison);
    Livraison updateLivraison(Long id, Livraison livraisonDetails);
    void deleteLivraison(Long id);
    List<Livraison> getLivraisonsByStatus(LivraisonStatus status);
    Livraison assignVehicle(Long livraisonId, Long vehicleId);
    Map<String, Object> suggestBestVehicle(Long livraisonId);
    Map<String, Object> createLivraisonWithAiVehicleSuggestion(Livraison livraison);
    // New method that combines suggestion with automatic assignment
    Map<String, Object> suggestAndAssignBestVehicle(Long livraisonId);
}